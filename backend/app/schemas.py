from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator


Role = Literal["FARMER", "DRIVER", "BUYER", "BUSINESS", "ADMIN"]
PublicRole = Literal["FARMER", "DRIVER", "BUYER", "BUSINESS"]
PublicAccountType = Literal[
    "FARMER",
    "TRANSPORTER",
    "DRIVER",
    "WHOLESALER",
    "RETAILER",
    "FPO",
    "BUYER_BUSINESS",
]


def to_camel(value: str) -> str:
    first, *rest = value.split("_")
    return first + "".join(part.capitalize() for part in rest)


class ApiModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)


class RegisterRequest(ApiModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=120)
    password: str = Field(min_length=12, max_length=128)
    role: PublicRole
    account_type: PublicAccountType | None = None
    preferred_language: Literal["en", "hi", "mr"] = "en"
    mobile_number: str | None = Field(default=None, min_length=8, max_length=20)
    village: str | None = Field(default=None, min_length=2, max_length=120)
    district: str | None = Field(default=None, min_length=2, max_length=120)
    state: str | None = Field(default=None, min_length=2, max_length=120)
    company_name: str | None = Field(default=None, min_length=2, max_length=180)
    business_type: str | None = Field(default=None, max_length=48)
    gst_number: str | None = Field(default=None, min_length=15, max_length=15)
    business_address: str | None = Field(default=None, min_length=5, max_length=500)
    contact_phone: str | None = Field(default=None, max_length=32)

    @model_validator(mode="after")
    def require_business_profile(self):
        if self.account_type == "FARMER" and self.role != "FARMER":
            raise ValueError("Farmer accounts must use the FARMER role")
        if self.account_type == "DRIVER" and self.role != "DRIVER":
            raise ValueError("Driver accounts must use the DRIVER role")
        if self.account_type in {"TRANSPORTER", "WHOLESALER", "RETAILER", "FPO", "BUYER_BUSINESS"} and self.role != "BUSINESS":
            raise ValueError("Business account types must use the BUSINESS role")
        return self


class LoginRequest(ApiModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class UserPreferencesUpdate(ApiModel):
    preferred_language: Literal["en", "hi", "mr"]


class GoogleAuthRequest(ApiModel):
    credential: str = Field(min_length=20, max_length=8192)


class UserRead(ApiModel):
    id: str
    email: EmailStr
    full_name: str
    role: Role
    account_type: str | None = None
    preferred_language: str = "en"
    mobile_number: str | None = None
    mobile_verified: bool = False
    service_area: str | None = None
    preferred_pickup_area: str | None = None
    kyc_status: str = "NOT_STARTED"


class KycProfileUpdate(ApiModel):
    account_type: PublicAccountType
    profile: dict[str, Any]


class KycDocumentRead(ApiModel):
    id: str
    document_type: str
    vehicle_id: str | None = None
    original_filename: str
    content_type: str
    size_bytes: int
    status: str
    expires_at: datetime | None
    review_reason: str | None
    uploaded_at: datetime


class KycApplicationRead(ApiModel):
    id: str
    user_id: str
    application_number: str
    account_type: str
    status: str
    profile: dict[str, Any]
    completion_percent: int
    submitted_at: datetime | None
    review_note: str | None
    documents: list[KycDocumentRead]


class KycApplicationSummaryRead(ApiModel):
    id: str
    user_id: str
    application_number: str
    account_type: str
    status: str
    submitted_at: datetime | None
    applicant_name: str
    applicant_email: EmailStr
    applicant_mobile: str | None


class KycReviewRequest(ApiModel):
    action: Literal["UNDER_REVIEW", "APPROVED", "REJECTED"]
    reason: str | None = Field(default=None, max_length=2000)


class KycDocumentReviewRequest(ApiModel):
    action: Literal["VERIFIED", "REJECTED", "REQUEST_REUPLOAD"]
    reason: str | None = Field(default=None, max_length=2000)


class KycVehicleCreate(ApiModel):
    details: dict[str, Any]


class KycVehicleRead(ApiModel):
    id: str
    details: dict[str, Any]
    status: str
    created_at: datetime


class KycVehicleAdminRead(ApiModel):
    id: str
    owner_id: str
    owner_name: str
    owner_email: EmailStr
    details: dict[str, Any]
    status: str
    created_at: datetime


class VerifiedTransporterRead(ApiModel):
    id: str
    company_name: str


class DriverTransporterAssignment(ApiModel):
    transporter_id: str


class AuthResponse(ApiModel):
    user: UserRead


class ShipmentCreate(ApiModel):
    crop: str = Field(min_length=2, max_length=80)
    variety: str = Field(default="", max_length=120)
    quantity_kg: float = Field(gt=0, le=1_000_000)
    vehicle_type: str | None = Field(default=None, max_length=48)
    cargo_volume_m3: float | None = Field(default=None, gt=0, le=10_000)
    harvest_at: datetime
    expected_shelf_life_hours: float = Field(gt=0, le=10_000)
    quality_grade: str = Field(min_length=2, max_length=80)
    storage_condition: str = Field(default="Not specified", max_length=120)
    origin: str = Field(min_length=2, max_length=240)
    destination: str = Field(min_length=2, max_length=240)

    @field_validator("harvest_at")
    @classmethod
    def require_timezone(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("harvestAt must include a timezone")
        return value


class ShipmentRead(ApiModel):
    id: str
    tracking_number: str
    farmer_id: str
    driver_id: str | None
    buyer_id: str | None
    crop: str
    variety: str
    quantity_kg: float
    vehicle_type: str | None
    cargo_volume_m3: float | None
    harvest_at: datetime
    expected_shelf_life_hours: float
    quality_grade: str
    storage_condition: str
    origin: str
    destination: str
    status: str
    created_at: datetime
    updated_at: datetime


class AssignDriverRequest(ApiModel):
    driver_id: str


class LocationCreate(ApiModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    accuracy_meters: float | None = Field(default=None, ge=0, le=100_000)
    speed_kmh: float | None = Field(default=None, ge=0, le=300)


class LocationRead(ApiModel):
    shipment_id: str
    driver_id: str
    latitude: float
    longitude: float
    accuracy_meters: float | None
    speed_kmh: float | None
    recorded_at: datetime


class RerouteRequest(ApiModel):
    destination: str = Field(min_length=2, max_length=240)
    reason: str = Field(min_length=10, max_length=2000)


class RerouteAuditRead(ApiModel):
    id: str
    shipment_id: str
    actor_id: str
    original_destination: str
    recommended_destination: str
    reason: str
    approved_at: datetime


class BusinessProfileRead(ApiModel):
    id: str
    user_id: str
    legal_name: str
    business_type: str
    gst_number: str | None
    address: str
    contact_phone: str | None
    is_verified: bool
    created_at: datetime


class BusinessProfileCreate(ApiModel):
    legal_name: str = Field(min_length=2, max_length=180)
    business_type: str = Field(min_length=2, max_length=48)
    gst_number: str | None = Field(default=None, min_length=15, max_length=15)
    address: str = Field(min_length=5, max_length=500)
    contact_phone: str | None = Field(default=None, max_length=32)


class BusinessLocationCreate(ApiModel):
    label: str = Field(min_length=2, max_length=80)
    address: str = Field(min_length=5, max_length=500)


class BusinessLocationRead(ApiModel):
    id: str
    business_id: str
    label: str
    address: str
    created_at: datetime


class BusinessListingCreate(ApiModel):
    crop: str = Field(min_length=2, max_length=80)
    market_category_id: str = Field(min_length=3, max_length=80)
    variety: str = Field(default="", max_length=120)
    grade: str = Field(min_length=2, max_length=80)
    quantity_kg: float = Field(gt=0, le=1_000_000)
    minimum_order_kg: float = Field(default=1, gt=0)
    price_per_kg: float = Field(gt=0, le=10_000_000)
    pickup_location: str = Field(min_length=2, max_length=240)


class BusinessListingRead(ApiModel):
    id: str
    seller_id: str
    crop: str
    market_category_id: str | None = None
    variety: str
    grade: str
    quantity_kg: float
    available_quantity_kg: float
    minimum_order_kg: float
    price_per_kg: float
    pickup_location: str
    status: str
    created_at: datetime


class CropMarketCategoryRateRead(ApiModel):
    category_id: str
    source_category_id: str
    crop: str
    category: str
    recommendation_use: str
    active_offer_count: int
    available_quantity_kg: float
    low_price_per_kg: float | None
    average_price_per_kg: float | None
    high_price_per_kg: float | None
    rank_score: int | None


class BusinessOrderCreate(ApiModel):
    listing_id: str
    quantity_kg: float = Field(gt=0)


class BusinessOrderOffer(ApiModel):
    price_per_kg: float = Field(gt=0, le=10_000_000)


class BusinessOrderRead(ApiModel):
    id: str
    listing_id: str
    buyer_id: str
    seller_id: str
    quantity_kg: float
    current_offer_per_kg: float
    status: str
    created_at: datetime


class BusinessTransactionRead(ApiModel):
    id: str
    listing_id: str
    buyer_name: str
    seller_name: str
    crop: str
    grade: str
    pickup_location: str
    quantity_kg: float
    price_per_kg: float
    total_value_inr: float
    status: str
    payment_status: Literal["NOT_RECORDED"] = "NOT_RECORDED"
    created_at: datetime
    updated_at: datetime


class TransportRequestCreate(ApiModel):
    shipment_id: str | None = None
    pickup: str = Field(min_length=2, max_length=240)
    destination: str = Field(min_length=2, max_length=240)
    quantity_kg: float = Field(gt=0, le=1_000_000)
    preferred_vehicle_type: str | None = Field(default=None, max_length=48)
    cargo_volume_m3: float | None = Field(default=None, gt=0, le=10_000)
    refrigerated: bool = False
    truck_count: int = Field(ge=1, le=100)
    delivery_at: datetime

    @field_validator("delivery_at")
    @classmethod
    def require_delivery_timezone(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("deliveryAt must include a timezone")
        return value


class TransportRequestRead(ApiModel):
    id: str
    requester_id: str
    shipment_id: str | None
    pickup: str
    destination: str
    quantity_kg: float
    preferred_vehicle_type: str | None
    cargo_volume_m3: float | None
    refrigerated: bool
    truck_count: int
    delivery_at: datetime
    status: str
    created_at: datetime


class BusinessNegotiationRead(ApiModel):
    id: str
    order_id: str
    actor_id: str
    price_per_kg: float
    created_at: datetime


class TransportQuoteCreate(ApiModel):
    price_inr: float = Field(gt=0, le=1_000_000_000)
    vehicle_count: int = Field(ge=1, le=100)
    estimated_hours: float = Field(gt=0, le=10_000)
    vehicle_type: str = Field(default="unspecified", min_length=2, max_length=48)
    refrigerated: bool = False


class TransportQuoteRead(ApiModel):
    id: str
    request_id: str
    carrier_id: str
    carrier_name: str
    carrier_company: str
    vehicle_type: str
    refrigerated: bool
    price_inr: float
    vehicle_count: int
    estimated_hours: float
    status: str
    created_at: datetime


class VehicleAvailabilityCreate(ApiModel):
    driver_id: str | None = None
    vehicle_number: str = Field(min_length=4, max_length=32)
    vehicle_type: str = Field(min_length=2, max_length=48)
    current_location: str = Field(min_length=2, max_length=240)
    pickup_area: str = Field(min_length=2, max_length=120)
    destination: str = Field(min_length=2, max_length=120)
    route: str = Field(default="", max_length=500)
    available_capacity: float = Field(gt=0, le=100_000)
    total_capacity: float = Field(gt=0, le=100_000)
    rate_inr: float = Field(gt=0, le=1_000_000_000)
    refrigerated: bool = False
    departure_time: datetime
    estimated_arrival_time: datetime | None = None

    @model_validator(mode="after")
    def validate_vehicle_capacity_and_times(self):
        if self.available_capacity > self.total_capacity:
            raise ValueError("Available capacity cannot exceed total capacity")
        if self.departure_time.tzinfo is None or self.departure_time.utcoffset() is None:
            raise ValueError("departureTime must include a timezone")
        if self.estimated_arrival_time and (
            self.estimated_arrival_time.tzinfo is None or self.estimated_arrival_time.utcoffset() is None
        ):
            raise ValueError("estimatedArrivalTime must include a timezone")
        return self


class VehicleAvailabilityUpdate(ApiModel):
    current_location: str | None = Field(default=None, min_length=2, max_length=240)
    pickup_area: str | None = Field(default=None, min_length=2, max_length=120)
    destination: str | None = Field(default=None, min_length=2, max_length=120)
    route: str | None = Field(default=None, max_length=500)
    available_capacity: float | None = Field(default=None, ge=0, le=100_000)
    departure_time: datetime | None = None
    estimated_arrival_time: datetime | None = None
    status: Literal["DEPARTED", "CANCELLED"] | None = None


class VehicleAvailabilityRead(ApiModel):
    id: str
    owner_id: str
    driver_id: str | None
    vehicle_number: str
    vehicle_type: str
    current_location: str
    pickup_area: str
    destination: str
    route: str
    available_capacity: float
    total_capacity: float
    rate_inr: float
    refrigerated: bool
    departure_time: datetime
    estimated_arrival_time: datetime | None
    status: str
    created_at: datetime
    updated_at: datetime


class VehicleBookingCreate(ApiModel):
    requested_capacity_kg: float = Field(gt=0, le=100_000)
    shipment_id: str | None = None


class VehicleBookingRead(ApiModel):
    id: str
    vehicle_id: str
    requester_id: str
    shipment_id: str | None
    requested_capacity_kg: float
    status: str
    created_at: datetime


class VehicleNotificationRead(ApiModel):
    id: str
    vehicle_id: str
    event_type: str
    title: str
    message: str
    is_read: bool
    created_at: datetime


class InsuranceApplicationCreate(ApiModel):
    shipment_id: str | None = None
    crop: str = Field(min_length=2, max_length=80)
    coverage_type: Literal["TRANSIT", "WEATHER", "COMPREHENSIVE"]
    insured_value_inr: float = Field(gt=0, le=1_000_000_000)
    requested_coverage_inr: float = Field(gt=0, le=1_000_000_000)
    origin: str = Field(min_length=2, max_length=240)
    destination: str = Field(min_length=2, max_length=240)
    harvest_at: datetime
    notes: str = Field(default="", max_length=2000)

    @field_validator("harvest_at")
    @classmethod
    def require_insurance_harvest_timezone(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("harvestAt must include a timezone")
        return value


class InsuranceApplicationRead(ApiModel):
    id: str
    farmer_id: str
    shipment_id: str | None
    crop: str
    coverage_type: str
    insured_value_inr: float
    requested_coverage_inr: float
    origin: str
    destination: str
    harvest_at: datetime
    notes: str
    status: str
    review_notes: str
    created_at: datetime


class InsuranceApplicationReview(ApiModel):
    status: Literal["NEEDS_INFO", "REFERRED", "DECLINED"]
    review_notes: str = Field(min_length=5, max_length=2000)