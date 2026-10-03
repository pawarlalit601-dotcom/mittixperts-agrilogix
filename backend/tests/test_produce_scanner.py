from io import BytesIO

from fastapi import HTTPException
from PIL import Image
from sqlalchemy import select

from app.database import SessionLocal
from app.models import User
from app.produce_grading import (
    GeminiObservation,
    configured_profile,
    estimate_logistics,
    freshness_score_reason,
    grade_produce,
)
from app.produce_scanner import _prepare_vision_image


def make_image(size: tuple[int, int] = (300, 300), color: str = "#d95030") -> bytes:
    image = Image.new("RGB", size, color)
    output = BytesIO()
    image.save(output, format="JPEG")
    return output.getvalue()


def make_observation(**overrides) -> GeminiObservation:
    values = {
        "status": "ANALYZED",
        "is_farm_produce": True,
        "produce_name": "Tomato",
        "category": "vegetable",
        "confidence": 0.96,
        "image_quality_usable": True,
        "ripeness": "ripe",
        "color": "red",
        "color_uniformity": 95,
        "visible_freshness": 94,
    }
    values.update(overrides)
    return GeminiObservation(**values)


def authenticated_farmer(client) -> None:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "scanner-farmer@example.com",
            "fullName": "Scanner Farmer",
            "password": "correct horse battery staple",
            "role": "FARMER",
        },
    )
    assert response.status_code == 201
    login = client.post(
        "/api/v1/auth/login",
        json={"email": "scanner-farmer@example.com", "password": "correct horse battery staple"},
    )
    assert login.status_code == 200
    with SessionLocal() as db:
        user = db.scalar(select(User).where(User.email == "scanner-farmer@example.com"))
        assert user is not None
        user.kyc_status = "VERIFIED"
        db.commit()


def test_grading_engine_rejects_severe_mold_and_grades_sound_tomatoes():
    profile = configured_profile("tomato")
    assert profile is not None

    grade, score = grade_produce(make_observation(), profile)
    assert grade == "Grade A"
    assert score >= profile.grade_a_minimum

    rejected_grade, _ = grade_produce(make_observation(mold="moderate"), profile)
    assert rejected_grade == "REJECT"


def test_fresh_ripe_mango_is_not_scored_low_from_gemini_estimate_alone():
    profile = configured_profile("mango")
    assert profile is not None
    observation = make_observation(
        produce_name="Mango",
        category="fruit",
        visible_freshness=41,
        ripeness="ripe",
        color_uniformity=95,
    )

    grade, score = grade_produce(observation, profile)
    _, _, freshness_score = estimate_logistics(
        observation=observation,
        profile=profile,
        grade=grade,
        grade_score=score,
        temperature_c=None,
        humidity_pct=None,
        harvested_hours_ago=0,
        transit_hours=1,
    )

    assert grade == "Grade A"
    assert freshness_score >= 80


def test_freshness_reason_names_visible_or_storage_factors():
    profile = configured_profile("mango")
    assert profile is not None
    observation = make_observation(
        produce_name="Mango",
        category="fruit",
        bruising="moderate",
        visible_freshness=90,
    )

    reason = freshness_score_reason(observation, profile, 25, None)

    assert "moderate bruising" in reason
    assert "temperature outside the configured range" in reason


def test_gemini_structured_schema_omits_unsupported_additional_properties():
    schema = GeminiObservation.model_json_schema()

    assert "additionalProperties" not in schema
    assert "additional_properties" not in str(schema)


def test_vision_image_is_resized_and_encoded_for_fast_request():
    original = make_image((2400, 1800))

    prepared = _prepare_vision_image(original)

    with Image.open(BytesIO(prepared)) as image:
        assert image.format == "JPEG"
        assert max(image.size) == 1280
        assert len(prepared) < len(original)


def test_shelf_life_uses_harvest_age_and_route_duration():
    profile = configured_profile("tomato")
    assert profile is not None
    observation = make_observation()
    grade, score = grade_produce(observation, profile)

    fresh_estimate, _, _ = estimate_logistics(
        observation=observation,
        profile=profile,
        grade=grade,
        grade_score=score,
        temperature_c=None,
        humidity_pct=None,
        harvested_hours_ago=None,
        transit_hours=1,
    )
    aged_estimate, aged_logistics, _ = estimate_logistics(
        observation=observation,
        profile=profile,
        grade=grade,
        grade_score=score,
        temperature_c=30,
        humidity_pct=50,
        harvested_hours_ago=24,
        transit_hours=120,
    )

    assert aged_estimate.max_days < fresh_estimate.max_days
    assert aged_estimate.ai_assisted is True
    assert aged_logistics.recommendation_code == "REROUTE"


def test_logistics_requires_a_route_estimate_before_calling_it_safe():
    profile = configured_profile("tomato")
    assert profile is not None
    observation = make_observation()
    grade, score = grade_produce(observation, profile)

    _, logistics, _ = estimate_logistics(
        observation=observation,
        profile=profile,
        grade=grade,
        grade_score=score,
        temperature_c=None,
        humidity_pct=None,
        harvested_hours_ago=None,
        transit_hours=None,
    )

    assert logistics.recommendation_code == "TRANSIT_ESTIMATE_REQUIRED"


def test_scanner_requires_authentication(client):
    response = client.post(
        "/api/v1/produce-scanner/analyze",
        files={"image": ("produce.jpg", make_image(), "image/jpeg")},
    )

    assert response.status_code == 401


def test_scanner_returns_only_unsupported_status_for_nonproduce(client, monkeypatch):
    authenticated_farmer(client)
    monkeypatch.setattr(
        "app.produce_scanner.inspect_with_gemini",
        lambda *_: make_observation(
            status="UNSUPPORTED_IMAGE",
            is_farm_produce=False,
            produce_name=None,
            category=None,
            confidence=0,
        ),
    )

    response = client.post(
        "/api/v1/produce-scanner/analyze",
        files={"image": ("object.jpg", make_image(), "image/jpeg")},
    )

    assert response.status_code == 200
    assert response.json() == {"isFarmProduce": False, "status": "UNSUPPORTED_IMAGE"}


def test_scanner_stops_before_gemini_for_low_resolution_image(client, monkeypatch):
    authenticated_farmer(client)

    def fail_if_called(*_):
        raise AssertionError("Gemini must not be called for an unusable image")

    monkeypatch.setattr("app.produce_scanner.inspect_with_gemini", fail_if_called)
    response = client.post(
        "/api/v1/produce-scanner/analyze",
        files={"image": ("small.jpg", make_image((120, 120)), "image/jpeg")},
    )

    assert response.status_code == 200
    assert response.json() == {"status": "IMAGE_QUALITY_INSUFFICIENT"}


def test_scanner_returns_grade_and_safe_route_for_supported_produce(client, monkeypatch):
    authenticated_farmer(client)
    observed_inputs = {}
    original_estimate = estimate_logistics

    def record_conditions(**conditions):
        observed_inputs.update(conditions)
        return original_estimate(**conditions)

    monkeypatch.setattr(
        "app.produce_scanner.inspect_with_gemini",
        lambda *_: make_observation(category="fruit"),
    )
    monkeypatch.setattr("app.produce_scanner.estimate_logistics", record_conditions)

    response = client.post(
        "/api/v1/produce-scanner/analyze",
        data={
            "transit_hours": "24",
            "temperature_c": "11",
            "humidity_pct": "88",
            "harvested_hours_ago": "12",
        },
        files={"image": ("tomatoes.jpg", make_image(), "image/jpeg")},
    )

    assert response.status_code == 200
    result = response.json()
    assert result["produceName"] == "Tomato"
    assert result["qualityGrade"] == "Grade A"
    assert result["shelfLife"]["aiAssisted"] is True
    assert result["logistics"]["recommendationCode"] == "SAFE_FOR_ROUTE"
    assert observed_inputs["transit_hours"] == 24
    assert observed_inputs["temperature_c"] == 11
    assert observed_inputs["humidity_pct"] == 88
    assert observed_inputs["harvested_hours_ago"] == 12


def test_scanner_rejects_non_image_file(client):
    authenticated_farmer(client)

    response = client.post(
        "/api/v1/produce-scanner/analyze",
        files={"image": ("notes.txt", b"not an image", "text/plain")},
    )

    assert response.status_code == 415
    assert "JPEG, PNG, or WebP" in response.json()["detail"]


def test_scanner_available_to_authenticated_farmer_without_completed_kyc(client, monkeypatch):
    registration = client.post(
        "/api/v1/auth/register",
        json={
            "email": "new-scanner-farmer@example.com",
            "fullName": "New Scanner Farmer",
            "password": "correct horse battery staple",
            "role": "FARMER",
        },
    )
    assert registration.status_code == 201
    login = client.post(
        "/api/v1/auth/login",
        json={"email": "new-scanner-farmer@example.com", "password": "correct horse battery staple"},
    )
    assert login.status_code == 200
    monkeypatch.setattr(
        "app.produce_scanner.inspect_with_gemini",
        lambda *_: make_observation(category="fruit"),
    )

    response = client.post(
        "/api/v1/produce-scanner/analyze",
        data={"transit_hours": "24"},
        files={"image": ("tomatoes.jpg", make_image(), "image/jpeg")},
    )

    assert response.status_code == 200
    assert response.json()["status"] == "ANALYZED"


def test_scanner_explains_gemini_overload_without_returning_a_grade(client, monkeypatch):
    authenticated_farmer(client)

    def provider_busy(*_):
        raise HTTPException(
            status_code=503,
            detail="Gemini Vision is temporarily busy. Your image was not graded; wait a moment and analyze it again.",
        )

    monkeypatch.setattr("app.produce_scanner.inspect_with_gemini", provider_busy)
    response = client.post(
        "/api/v1/produce-scanner/analyze",
        files={"image": ("produce.jpg", make_image(), "image/jpeg")},
    )

    assert response.status_code == 503
    assert "image was not graded" in response.json()["detail"]


def test_scanner_explains_rejected_gemini_credential(client, monkeypatch):
    authenticated_farmer(client)

    def invalid_credential(*_):
        raise HTTPException(
            status_code=503,
            detail="Gemini rejected the configured API credential. Set GEMINI_API_KEY to a valid Gemini API key in backend/.env, then restart the API. This image was not analyzed.",
        )

    monkeypatch.setattr("app.produce_scanner.inspect_with_gemini", invalid_credential)
    response = client.post(
        "/api/v1/produce-scanner/analyze",
        files={"image": ("produce.jpg", make_image(), "image/jpeg")},
    )

    assert response.status_code == 503
    assert "valid Gemini API key" in response.json()["detail"]
    assert "not analyzed" in response.json()["detail"]
