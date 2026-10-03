from dataclasses import dataclass
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas import to_camel


Severity = Literal["none", "minor", "moderate", "severe"]
Ripeness = Literal["unripe", "turning", "ripe", "overripe", "unknown"]
ProduceCategory = Literal["fruit", "vegetable", "grain", "cereal", "pulse", "other"]
QualityGrade = Literal["Grade A", "Grade B", "Grade C", "REJECT"]
SpoilageRisk = Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
RecommendationCode = Literal[
    "SAFE_FOR_ROUTE",
    "EXPEDITE",
    "REROUTE",
    "DO_NOT_SHIP",
    "TRANSIT_ESTIMATE_REQUIRED",
]


class GeminiObservation(BaseModel):
    status: Literal["ANALYZED", "UNSUPPORTED_IMAGE", "IMAGE_QUALITY_INSUFFICIENT"]
    is_farm_produce: bool
    produce_name: str | None = None
    category: ProduceCategory | None = None
    confidence: float = Field(ge=0, le=1)
    image_quality_usable: bool
    quality_issues: list[str] = Field(default_factory=list, max_length=8)
    ripeness: Ripeness = "unknown"
    color: str | None = Field(default=None, max_length=80)
    color_uniformity: int = Field(default=0, ge=0, le=100)
    bruising: Severity = "none"
    cuts: Severity = "none"
    cracks: Severity = "none"
    discoloration: Severity = "none"
    mold: Severity = "none"
    rot: Severity = "none"
    shriveling: Severity = "none"
    visible_freshness: int = Field(ge=0, le=100)
    other_visible_defects: list[str] = Field(default_factory=list, max_length=8)


class ScanApiModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class UnsupportedImage(ScanApiModel):
    is_farm_produce: Literal[False] = False
    status: Literal["UNSUPPORTED_IMAGE"] = "UNSUPPORTED_IMAGE"


class InsufficientImageQuality(ScanApiModel):
    status: Literal["IMAGE_QUALITY_INSUFFICIENT"] = "IMAGE_QUALITY_INSUFFICIENT"


class VisualQuality(ScanApiModel):
    ripeness: Ripeness
    color: str | None
    color_uniformity: int
    bruising: Severity
    cuts: Severity
    cracks: Severity
    discoloration: Severity
    mold: Severity
    rot: Severity
    shriveling: Severity
    other_visible_defects: list[str]


class ShelfLifeEstimate(ScanApiModel):
    min_days: float
    max_days: float
    confidence: float
    basis: str
    ai_assisted: bool


class LogisticsAssessment(ScanApiModel):
    spoilage_risk: SpoilageRisk
    recommendation_code: RecommendationCode
    recommendation: str
    transit_hours: float | None


class ProduceAnalysis(ScanApiModel):
    status: Literal["ANALYZED"] = "ANALYZED"
    is_farm_produce: Literal[True] = True
    produce_name: str
    category: ProduceCategory
    confidence: float
    quality: VisualQuality
    quality_grade: QualityGrade
    grade_score: int
    freshness_score: int
    freshness_reason: str
    shelf_life: ShelfLifeEstimate
    logistics: LogisticsAssessment


@dataclass(frozen=True)
class ProduceProfile:
    name: str
    category: ProduceCategory
    baseline_shelf_life_days: float
    temperature_range_c: tuple[float, float]
    humidity_range_pct: tuple[float, float]
    ripeness_factors: dict[Ripeness, float]
    damage_factors: dict[str, float]
    grade_a_minimum: int = 84
    grade_b_minimum: int = 66
    grade_c_minimum: int = 40


_FRUIT_FACTORS: dict[Ripeness, float] = {
    "unripe": 0.9,
    "turning": 1.0,
    "ripe": 0.8,
    "overripe": 0.35,
    "unknown": 0.7,
}
_VEGETABLE_FACTORS: dict[Ripeness, float] = {
    "unripe": 0.85,
    "turning": 1.0,
    "ripe": 0.9,
    "overripe": 0.55,
    "unknown": 0.75,
}
_DRY_FACTORS: dict[Ripeness, float] = {
    "unripe": 0.9,
    "turning": 1.0,
    "ripe": 1.0,
    "overripe": 0.9,
    "unknown": 0.9,
}
_DAMAGE_FACTORS = {
    "bruising": 14,
    "cuts": 18,
    "cracks": 14,
    "discoloration": 12,
    "mold": 35,
    "rot": 45,
    "shriveling": 15,
}
_SEVERITY_MULTIPLIERS: dict[Severity, float] = {
    "none": 0,
    "minor": 0.35,
    "moderate": 0.7,
    "severe": 1,
}


def _profile(
    name: str,
    category: ProduceCategory,
    days: float,
    temperature: tuple[float, float],
    humidity: tuple[float, float],
    ripeness_factors: dict[Ripeness, float],
    *,
    grade_a: int = 84,
    grade_b: int = 66,
    grade_c: int = 40,
) -> ProduceProfile:
    return ProduceProfile(
        name=name,
        category=category,
        baseline_shelf_life_days=days,
        temperature_range_c=temperature,
        humidity_range_pct=humidity,
        ripeness_factors=ripeness_factors,
        damage_factors=_DAMAGE_FACTORS,
        grade_a_minimum=grade_a,
        grade_b_minimum=grade_b,
        grade_c_minimum=grade_c,
    )


# Add configured commodities here with their own storage, ripeness, damage, and grade rules.
PRODUCE_PROFILES: dict[str, ProduceProfile] = {
    "tomato": _profile("Tomato", "vegetable", 7, (10, 15), (85, 95), _FRUIT_FACTORS),
    "potato": _profile("Potato", "vegetable", 30, (7, 12), (85, 95), _VEGETABLE_FACTORS),
    "onion": _profile("Onion", "vegetable", 45, (0, 4), (65, 75), _VEGETABLE_FACTORS),
    "mango": _profile("Mango", "fruit", 7, (10, 13), (85, 95), _FRUIT_FACTORS),
    "banana": _profile("Banana", "fruit", 7, (13, 14), (85, 95), _FRUIT_FACTORS),
    "apple": _profile("Apple", "fruit", 30, (0, 4), (90, 95), _FRUIT_FACTORS),
    "orange": _profile("Orange", "fruit", 21, (4, 8), (85, 90), _FRUIT_FACTORS),
    "grapes": _profile("Grapes", "fruit", 7, (0, 2), (90, 95), _FRUIT_FACTORS),
    "pomegranate": _profile("Pomegranate", "fruit", 30, (5, 8), (90, 95), _FRUIT_FACTORS),
    "cabbage": _profile("Cabbage", "vegetable", 21, (0, 2), (95, 100), _VEGETABLE_FACTORS),
    "carrot": _profile("Carrot", "vegetable", 21, (0, 2), (95, 100), _VEGETABLE_FACTORS),
    "cucumber": _profile("Cucumber", "vegetable", 7, (10, 12), (90, 95), _VEGETABLE_FACTORS),
    "brinjal": _profile("Brinjal", "vegetable", 5, (10, 12), (90, 95), _VEGETABLE_FACTORS),
    "eggplant": _profile("Brinjal", "vegetable", 5, (10, 12), (90, 95), _VEGETABLE_FACTORS),
    "chilli": _profile("Chilli", "vegetable", 10, (7, 10), (90, 95), _VEGETABLE_FACTORS),
    "chili": _profile("Chilli", "vegetable", 10, (7, 10), (90, 95), _VEGETABLE_FACTORS),
    "okra": _profile("Okra", "vegetable", 3, (7, 10), (90, 95), _VEGETABLE_FACTORS),
    "bell pepper": _profile("Bell Pepper", "vegetable", 14, (7, 10), (90, 95), _VEGETABLE_FACTORS),
    "capsicum": _profile("Bell Pepper", "vegetable", 14, (7, 10), (90, 95), _VEGETABLE_FACTORS),
    "spinach": _profile("Spinach", "vegetable", 4, (0, 2), (95, 100), _VEGETABLE_FACTORS),
    "lettuce": _profile("Lettuce", "vegetable", 7, (0, 2), (95, 100), _VEGETABLE_FACTORS),
    "broccoli": _profile("Broccoli", "vegetable", 7, (0, 2), (95, 100), _VEGETABLE_FACTORS),
    "cauliflower": _profile("Cauliflower", "vegetable", 7, (0, 2), (95, 100), _VEGETABLE_FACTORS),
    "garlic": _profile("Garlic", "vegetable", 60, (0, 4), (60, 70), _VEGETABLE_FACTORS),
    "ginger": _profile("Ginger", "vegetable", 30, (10, 13), (65, 75), _VEGETABLE_FACTORS),
    "pumpkin": _profile("Pumpkin", "vegetable", 60, (10, 15), (50, 70), _VEGETABLE_FACTORS),
    "green pea": _profile("Green Pea", "vegetable", 5, (0, 2), (90, 95), _VEGETABLE_FACTORS),
    "peas": _profile("Green Pea", "vegetable", 5, (0, 2), (90, 95), _VEGETABLE_FACTORS),
    "green bean": _profile("Green Bean", "vegetable", 7, (4, 7), (90, 95), _VEGETABLE_FACTORS),
    "wheat": _profile("Wheat", "cereal", 180, (10, 25), (35, 55), _DRY_FACTORS),
    "rice": _profile("Rice", "cereal", 180, (10, 25), (35, 55), _DRY_FACTORS),
    "maize": _profile("Maize", "cereal", 120, (10, 25), (35, 55), _DRY_FACTORS),
    "corn": _profile("Maize", "cereal", 120, (10, 25), (35, 55), _DRY_FACTORS),
    "sorghum": _profile("Sorghum", "cereal", 180, (10, 25), (35, 55), _DRY_FACTORS),
    "millet": _profile("Millet", "cereal", 180, (10, 25), (35, 55), _DRY_FACTORS),
    "barley": _profile("Barley", "cereal", 180, (10, 25), (35, 55), _DRY_FACTORS),
    "oats": _profile("Oats", "cereal", 180, (10, 25), (35, 55), _DRY_FACTORS),
    "chickpea": _profile("Chickpea", "pulse", 180, (10, 25), (35, 55), _DRY_FACTORS),
    "lentil": _profile("Lentil", "pulse", 180, (10, 25), (35, 55), _DRY_FACTORS),
    "pigeon pea": _profile("Pigeon Pea", "pulse", 180, (10, 25), (35, 55), _DRY_FACTORS),
    "black gram": _profile("Black Gram", "pulse", 180, (10, 25), (35, 55), _DRY_FACTORS),
    "green gram": _profile("Green Gram", "pulse", 180, (10, 25), (35, 55), _DRY_FACTORS),
    "kidney bean": _profile("Kidney Bean", "pulse", 180, (10, 25), (35, 55), _DRY_FACTORS),
    "soybean": _profile("Soybean", "pulse", 120, (10, 25), (35, 55), _DRY_FACTORS),
    "groundnut": _profile("Groundnut", "other", 120, (10, 25), (35, 55), _DRY_FACTORS),
}


def configured_profile(produce_name: str) -> ProduceProfile | None:
    return PRODUCE_PROFILES.get(" ".join(produce_name.casefold().split()))


def category_matches(observed_category: ProduceCategory | None, profile: ProduceProfile) -> bool:
    if observed_category is None:
        return False
    if profile.category in {"fruit", "vegetable"}:
        return observed_category in {"fruit", "vegetable"}
    if profile.category == "cereal":
        return observed_category in {"grain", "cereal"}
    if profile.category == "other":
        return observed_category in {"other", "pulse"}
    return observed_category == profile.category


def grade_produce(observation: GeminiObservation, profile: ProduceProfile) -> tuple[QualityGrade, int]:
    # Treat Gemini's subjective freshness estimate as one signal, not the whole score.
    # Concrete visible defects and storage conditions should drive the result.
    score = round(80 + observation.visible_freshness * 0.2)
    for defect, severity in (
        ("bruising", observation.bruising),
        ("cuts", observation.cuts),
        ("cracks", observation.cracks),
        ("discoloration", observation.discoloration),
        ("mold", observation.mold),
        ("rot", observation.rot),
        ("shriveling", observation.shriveling),
    ):
        score -= profile.damage_factors[defect] * _SEVERITY_MULTIPLIERS[severity]

    if observation.ripeness == "overripe":
        score -= 14
    elif observation.ripeness == "unripe" and profile.category in {"fruit", "vegetable"}:
        score -= 5
    score -= max(0, 75 - observation.color_uniformity) * 0.12
    score = max(0, min(100, round(score)))

    if observation.mold in {"moderate", "severe"} or observation.rot == "severe" or score < profile.grade_c_minimum:
        return "REJECT", score
    if score >= profile.grade_a_minimum:
        return "Grade A", score
    if score >= profile.grade_b_minimum:
        return "Grade B", score
    return "Grade C", score


def freshness_score_reason(
    observation: GeminiObservation,
    profile: ProduceProfile,
    temperature_c: float | None,
    humidity_pct: float | None,
) -> str:
    reasons: list[str] = []
    for defect, severity in (
        ("bruising", observation.bruising),
        ("cuts", observation.cuts),
        ("cracks", observation.cracks),
        ("discoloration", observation.discoloration),
        ("mold", observation.mold),
        ("rot", observation.rot),
        ("shriveling", observation.shriveling),
    ):
        if severity != "none":
            reasons.append(f"{severity} {defect}")

    if observation.ripeness == "overripe":
        reasons.append("over-ripeness")
    if observation.color_uniformity < 75:
        reasons.append("uneven color")
    if observation.visible_freshness < 60:
        reasons.append("reduced visual-freshness cues")

    low_temp, high_temp = profile.temperature_range_c
    if temperature_c is not None and not low_temp <= temperature_c <= high_temp:
        reasons.append("temperature outside the configured range")
    low_humidity, high_humidity = profile.humidity_range_pct
    if humidity_pct is not None and not low_humidity <= humidity_pct <= high_humidity:
        reasons.append("humidity outside the configured range")

    if reasons:
        return "Score reflects " + ", ".join(reasons[:3]) + "."
    return "No major visible defects; ripe appearance supports a high score."


def estimate_logistics(
    *,
    observation: GeminiObservation,
    profile: ProduceProfile,
    grade: QualityGrade,
    grade_score: int,
    temperature_c: float | None,
    humidity_pct: float | None,
    harvested_hours_ago: float | None,
    transit_hours: float | None,
) -> tuple[ShelfLifeEstimate, LogisticsAssessment, int]:
    ripeness_factor = profile.ripeness_factors[observation.ripeness]
    freshness_factor = 0.45 + 0.55 * (observation.visible_freshness / 100)
    damage_factor = max(0.35, 1 - (100 - grade_score) / 180)
    environmental_factor = 1.0

    if temperature_c is not None:
        low, high = profile.temperature_range_c
        deviation = max(low - temperature_c, temperature_c - high, 0)
        environmental_factor *= max(0.45, 1 - deviation * 0.025)
    if humidity_pct is not None:
        low, high = profile.humidity_range_pct
        deviation = max(low - humidity_pct, humidity_pct - high, 0)
        environmental_factor *= max(0.55, 1 - deviation * 0.008)

    remaining_hours = (
        profile.baseline_shelf_life_days
        * 24
        * ripeness_factor
        * freshness_factor
        * damage_factor
        * environmental_factor
    )
    if harvested_hours_ago is not None:
        remaining_hours = max(0, remaining_hours - harvested_hours_ago)
    if grade == "REJECT":
        remaining_hours = 0

    shelf_life_min = round(max(0, remaining_hours * 0.8 / 24), 1)
    shelf_life_max = round(max(0, remaining_hours * 1.15 / 24), 1)
    environmental_data_missing = temperature_c is None or humidity_pct is None
    estimate_data_missing = harvested_hours_ago is None or environmental_data_missing
    shelf_life = ShelfLifeEstimate(
        min_days=shelf_life_min,
        max_days=shelf_life_max,
        confidence=round(observation.confidence * (0.78 if estimate_data_missing else 0.9), 2),
        basis="Visual quality + ripeness + configured commodity parameters"
        + ("; storage or harvest-age inputs unavailable" if estimate_data_missing else "; storage and harvest-age inputs included"),
        ai_assisted=True,
    )

    if grade == "REJECT":
        risk: SpoilageRisk = "CRITICAL"
        recommendation_code: RecommendationCode = "DO_NOT_SHIP"
        recommendation = "Do not ship. Separate this lot and assess for safe disposal or approved processing."
    elif observation.mold in {"moderate", "severe"} or observation.rot in {"moderate", "severe"}:
        risk = "HIGH"
        recommendation_code = "REROUTE"
        recommendation = "Reroute to the nearest suitable market or approved processing facility; avoid a long transit."
    elif transit_hours is not None and transit_hours > shelf_life_max * 24:
        risk = "HIGH"
        recommendation_code = "REROUTE"
        recommendation = "Estimated transit exceeds the conservative usable-life window. Choose a nearer market or processing route."
    elif (
        grade == "Grade C"
        or observation.visible_freshness < 45
        or (transit_hours is not None and transit_hours > shelf_life_min * 24)
    ):
        risk = "MEDIUM"
        recommendation_code = "EXPEDITE"
        recommendation = "Use an expedited, temperature-managed route and prioritize unloading."
    elif transit_hours is None:
        risk = "MEDIUM"
        recommendation_code = "TRANSIT_ESTIMATE_REQUIRED"
        recommendation = "Confirm the Agrilogix route duration before dispatch; no transit estimate was supplied."
    else:
        risk = "LOW" if grade == "Grade A" and observation.visible_freshness >= 75 else "MEDIUM"
        recommendation_code = "SAFE_FOR_ROUTE"
        recommendation = "Current transit estimate fits the estimated remaining shelf-life window."

    if temperature_c is not None:
        low, high = profile.temperature_range_c
        if temperature_c < low or temperature_c > high:
            deviation = max(low - temperature_c, temperature_c - high)
            if deviation > 8 and risk not in {"HIGH", "CRITICAL"}:
                risk = "HIGH"
                if recommendation_code in {"SAFE_FOR_ROUTE", "EXPEDITE"}:
                    recommendation_code = "REROUTE"
            elif risk == "LOW":
                risk = "MEDIUM"
                recommendation_code = "EXPEDITE"
            recommendation += f" Maintain the configured {low:g}–{high:g}°C storage range."

    logistics = LogisticsAssessment(
        spoilage_risk=risk,
        recommendation_code=recommendation_code,
        recommendation=recommendation,
        transit_hours=transit_hours,
    )
    freshness_score = max(0, min(100, round(grade_score * environmental_factor)))
    return shelf_life, logistics, freshness_score
