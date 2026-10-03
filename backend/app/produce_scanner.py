import logging
from io import BytesIO
from time import perf_counter
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from google import genai
from google.genai import errors, types
from PIL import Image, ImageOps, ImageStat, UnidentifiedImageError
from pydantic import ValidationError
from app.config import get_settings
from app.deps import require_roles
from app.produce_grading import (
    GeminiObservation,
    InsufficientImageQuality,
    ProduceAnalysis,
    UnsupportedImage,
    category_matches,
    VisualQuality,
    configured_profile,
    estimate_logistics,
    freshness_score_reason,
    grade_produce,
)


logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/produce-scanner", tags=["produce quality scanner"])
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
IMAGE_FORMATS = {"image/jpeg": "JPEG", "image/png": "PNG", "image/webp": "WEBP"}
MIN_IMAGE_DIMENSION = 256
MAX_IMAGE_PIXELS = 40_000_000
MINIMUM_PRODUCE_CONFIDENCE = 0.65

VISION_PROMPT = """
You are Agrilogix's harvested-produce inspector, not a general image recognizer.
Return UNSUPPORTED_IMAGE for people, animals, objects, soil, plants still growing, leaves,
flowers, or anything that is not clearly harvested produce. Never name unsupported subjects.
Return IMAGE_QUALITY_INSUFFICIENT for unclear, dark, blurred, obstructed, or too-small produce.
Otherwise identify supported harvested fruit, vegetables, grain, cereal, pulses, or configured
commodities and report visible color, ripeness, freshness, and defects only. Do not infer
hidden defects or decide grade, shelf life, or route. Use none/unknown rather than guessing.
Do not treat a fruit's normal ripe color or ripeness as spoilage. Report low visible_freshness
only when clear visual signs such as shriveling, extensive bruising, mold, rot, or decay are
present; an intact, marketable ripe fruit should generally score 80 or higher.
"""


def _check_image(image_bytes: bytes, content_type: str) -> bool:
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=415, detail="Upload a JPEG, PNG, or WebP image.")
    try:
        with Image.open(BytesIO(image_bytes)) as image:
            if image.format not in {"JPEG", "PNG", "WEBP"}:
                raise HTTPException(status_code=415, detail="Upload a JPEG, PNG, or WebP image.")
            if image.format != IMAGE_FORMATS[content_type]:
                raise HTTPException(status_code=415, detail="Image content does not match its file type.")
            if image.width * image.height > MAX_IMAGE_PIXELS:
                raise HTTPException(status_code=413, detail="Image dimensions exceed the supported limit.")
            if image.width < MIN_IMAGE_DIMENSION or image.height < MIN_IMAGE_DIMENSION:
                return False
            image.verify()
        with Image.open(BytesIO(image_bytes)) as image:
            luminance = ImageStat.Stat(image.convert("L").resize((32, 32))).mean[0]
            if luminance < 24:
                return False
    except (UnidentifiedImageError, Image.DecompressionBombError, OSError, ValueError) as exc:
        raise HTTPException(status_code=422, detail="Upload a valid JPEG, PNG, or WebP image.") from exc
    return True


def _prepare_vision_image(image_bytes: bytes) -> bytes:
    with Image.open(BytesIO(image_bytes)) as image:
        image = ImageOps.exif_transpose(image).convert("RGB")
        image.thumbnail((1280, 1280), Image.Resampling.LANCZOS)
        output = BytesIO()
        image.save(output, format="JPEG", quality=82, optimize=True)
        return output.getvalue()


def inspect_with_gemini(image_bytes: bytes, content_type: str) -> GeminiObservation:
    settings = get_settings()
    api_key = settings.gemini_api_key.get_secret_value()
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Produce scanning is unavailable because the Gemini API key is not configured.",
        )

    vision_image = _prepare_vision_image(image_bytes)
    client = genai.Client(
        api_key=api_key,
        http_options=types.HttpOptions(
            timeout=20_000,
            retry_options=types.HttpRetryOptions(attempts=1),
        ),
    )
    started_at = perf_counter()
    try:
        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=[
                VISION_PROMPT,
                types.Part.from_bytes(data=vision_image, mime_type="image/jpeg"),
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=GeminiObservation,
                temperature=0,
                max_output_tokens=700,
                thinking_config=types.ThinkingConfig(thinking_level="MINIMAL"),
            ),
        )
    except errors.APIError as exc:
        logger.warning(
            "Gemini produce-scanner request failed after %.2fs with %s %s",
            perf_counter() - started_at,
            exc.code,
            exc.status,
        )
        if exc.code == 401:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Gemini rejected the configured API credential. Set GEMINI_API_KEY to a valid Gemini API key in backend/.env, then restart the API. This image was not analyzed.",
            ) from exc
        if exc.code == 403:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Gemini denied this request. Check that the configured API key has Gemini API access enabled. This image was not analyzed.",
            ) from exc
        if exc.code == 503:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Gemini Vision is temporarily busy. Your image was not graded; wait a moment and analyze it again.",
            ) from exc
        if exc.code == 429:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Gemini Vision is rate limited. Your image was not graded; wait a moment and analyze it again.",
            ) from exc
        if exc.code == 404:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"The configured Gemini model '{settings.gemini_model}' is not available to this API key. Update GEMINI_MODEL in backend/.env. This image was not analyzed.",
            ) from exc
        if exc.code == 400:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Gemini rejected the scan request. Check that the configured vision model supports structured JSON responses. This image was not analyzed.",
            ) from exc
        if exc.code >= 500:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Gemini Vision is temporarily unavailable ({exc.code}). Your image was not analyzed; try again shortly.",
            ) from exc
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gemini Vision rejected the scan request ({exc.code} {exc.status}). This image was not analyzed.",
        ) from exc
    finally:
        client.close()

    logger.info("Gemini produce scan completed in %.2fs", perf_counter() - started_at)
    if response.parsed is None:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The produce analysis service returned no usable assessment. Please try again.",
        )
    try:
        return GeminiObservation.model_validate(response.parsed)
    except ValidationError as exc:
        logger.exception("Gemini returned an invalid produce observation")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The produce analysis service returned an invalid assessment. Please try again.",
        ) from exc


@router.post(
    "/analyze",
    response_model=ProduceAnalysis | InsufficientImageQuality | UnsupportedImage,
    dependencies=[Depends(require_roles("FARMER"))],
)
def analyze_produce(
    image: Annotated[UploadFile, File()],
    transit_hours: Annotated[float | None, Form(ge=0, le=720)] = None,
    temperature_c: Annotated[float | None, Form(ge=-30, le=80)] = None,
    humidity_pct: Annotated[float | None, Form(ge=0, le=100)] = None,
    harvested_hours_ago: Annotated[float | None, Form(ge=0, le=8760)] = None,
) -> ProduceAnalysis | InsufficientImageQuality | UnsupportedImage:
    settings = get_settings()
    image_bytes = image.file.read(settings.produce_scan_max_bytes + 1)
    if len(image_bytes) > settings.produce_scan_max_bytes:
        raise HTTPException(status_code=413, detail="Image exceeds the 10 MB upload limit.")
    if not _check_image(image_bytes, image.content_type or ""):
        return InsufficientImageQuality()

    observation = inspect_with_gemini(image_bytes, image.content_type or "")
    if observation.status == "UNSUPPORTED_IMAGE" or not observation.is_farm_produce:
        return UnsupportedImage()
    if observation.status == "IMAGE_QUALITY_INSUFFICIENT" or not observation.image_quality_usable:
        return InsufficientImageQuality()

    profile = configured_profile(observation.produce_name or "")
    if profile is None or observation.confidence < MINIMUM_PRODUCE_CONFIDENCE:
        return UnsupportedImage()
    if not category_matches(observation.category, profile):
        return UnsupportedImage()

    grade, grade_score = grade_produce(observation, profile)
    shelf_life, logistics, freshness_score = estimate_logistics(
        observation=observation,
        profile=profile,
        grade=grade,
        grade_score=grade_score,
        temperature_c=temperature_c,
        humidity_pct=humidity_pct,
        harvested_hours_ago=harvested_hours_ago,
        transit_hours=transit_hours,
    )
    return ProduceAnalysis(
        produce_name=profile.name,
        category=profile.category,
        confidence=observation.confidence,
        quality=VisualQuality(
            ripeness=observation.ripeness,
            color=observation.color,
            color_uniformity=observation.color_uniformity,
            bruising=observation.bruising,
            cuts=observation.cuts,
            cracks=observation.cracks,
            discoloration=observation.discoloration,
            mold=observation.mold,
            rot=observation.rot,
            shriveling=observation.shriveling,
            other_visible_defects=observation.other_visible_defects,
        ),
        quality_grade=grade,
        grade_score=grade_score,
        freshness_score=freshness_score,
        freshness_reason=freshness_score_reason(
            observation,
            profile,
            temperature_c,
            humidity_pct,
        ),
        shelf_life=shelf_life,
        logistics=logistics,
    )
