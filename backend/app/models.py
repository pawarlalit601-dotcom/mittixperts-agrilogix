from datetime import UTC, datetime
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Index, Integer, LargeBinary, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def new_id() -> str:
    return str(uuid4())


def utc_now() -> datetime:
    return datetime.now(UTC)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(120))
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(16), index=True)
    account_type: Mapped[str | None] = mapped_column(String(24), index=True)
    preferred_language: Mapped[str] = mapped_column(String(5), default="en")
    mobile_number: Mapped[str | None] = mapped_column(String(20), index=True)
    mobile_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    service_area: Mapped[str | None] = mapped_column(String(120), index=True)
    preferred_pickup_area: Mapped[str | None] = mapped_column(String(120), index=True)
    kyc_status: Mapped[str] = mapped_column(String(24), default="NOT_STARTED", index=True)
    transporter_id: Mapped[str | None] = mapped_column(String(36), index=True)
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)


class UserActivity(Base):
    __tablename__ = "user_activity"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    action: Mapped[str] = mapped_column(String(64), index=True)
    route: Mapped[str | None] = mapped_column(String(200), index=True)
    method: Mapped[str | None] = mapped_column(String(16), index=True)
    status_code: Mapped[int | None] = mapped_column(Integer, index=True)
    ip_address: Mapped[str | None] = mapped_column(String(64), index=True)
    user_agent: Mapped[str | None] = mapped_column(String(240))
    details: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, index=True)


class KycApplication(Base):
    __tablename__ = "kyc_applications"
    __table_args__ = (Index("ix_kyc_applications_status_created", "status", "created_at"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    application_number: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    account_type: Mapped[str] = mapped_column(String(24), index=True)
    status: Mapped[str] = mapped_column(String(24), default="DRAFT", index=True)
    encrypted_profile: Mapped[bytes] = mapped_column(LargeBinary)
    completion_percent: Mapped[int] = mapped_column(Integer, default=0)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    reviewer_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"))
    review_note: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)


class KycDocument(Base):
    __tablename__ = "kyc_documents"
    __table_args__ = (Index("ix_kyc_documents_application_type", "application_id", "document_type"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    application_id: Mapped[str] = mapped_column(ForeignKey("kyc_applications.id", ondelete="CASCADE"), index=True)
    vehicle_id: Mapped[str | None] = mapped_column(ForeignKey("kyc_vehicles.id", ondelete="CASCADE"), index=True)
    document_type: Mapped[str] = mapped_column(String(48), index=True)
    original_filename: Mapped[str] = mapped_column(String(180))
    content_type: Mapped[str] = mapped_column(String(80))
    storage_key: Mapped[str] = mapped_column(String(64), unique=True)
    size_bytes: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(24), default="UPLOADED", index=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
    review_reason: Mapped[str | None] = mapped_column(Text)
    reviewed_by: Mapped[str | None] = mapped_column(ForeignKey("users.id"))
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)


class KycAuditEvent(Base):
    __tablename__ = "kyc_audit_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    application_id: Mapped[str] = mapped_column(ForeignKey("kyc_applications.id", ondelete="CASCADE"), index=True)
    actor_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    event_type: Mapped[str] = mapped_column(String(40), index=True)
    detail: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, index=True)


class KycDocumentAccessLog(Base):
    __tablename__ = "kyc_document_access_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    document_id: Mapped[str] = mapped_column(ForeignKey("kyc_documents.id", ondelete="CASCADE"), index=True)
    viewer_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    action: Mapped[str] = mapped_column(String(24), default="VIEW")
    accessed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, index=True)


class KycVehicle(Base):
    __tablename__ = "kyc_vehicles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    encrypted_details: Mapped[bytes] = mapped_column(LargeBinary)
    status: Mapped[str] = mapped_column(String(24), default="PENDING", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)


class CropMarketCategory(Base):
    __tablename__ = "crop_market_categories"
    __table_args__ = (UniqueConstraint("crop", "source_category_id", name="uq_crop_market_category_source"),)

    category_id: Mapped[str] = mapped_column(String(32), primary_key=True)
    source_category_id: Mapped[str] = mapped_column(String(32))
    crop: Mapped[str] = mapped_column(String(80), index=True)
    valid_market_category: Mapped[str] = mapped_column(String(160))
    eligibility_rule: Mapped[str] = mapped_column(String(16), index=True)
    recommendation_use: Mapped[str] = mapped_column(Text)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)


class Shipment(Base):
    __tablename__ = "shipments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    tracking_number: Mapped[str] = mapped_column(String(48), unique=True, index=True)
    farmer_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    driver_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), index=True)
    buyer_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), index=True)
    crop: Mapped[str] = mapped_column(String(80), index=True)
    variety: Mapped[str] = mapped_column(String(120), default="")
    quantity_kg: Mapped[float] = mapped_column(Float)
    vehicle_type: Mapped[str | None] = mapped_column(String(48))
    cargo_volume_m3: Mapped[float | None] = mapped_column(Float)
    harvest_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    expected_shelf_life_hours: Mapped[float] = mapped_column(Float)
    quality_grade: Mapped[str] = mapped_column(String(80))
    storage_condition: Mapped[str] = mapped_column(String(120), default="Not specified")
    origin: Mapped[str] = mapped_column(String(240))
    destination: Mapped[str] = mapped_column(String(240))
    status: Mapped[str] = mapped_column(String(32), default="CREATED", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)


class ShipmentLocation(Base):
    __tablename__ = "shipment_locations"
    __table_args__ = (Index("ix_shipment_locations_shipment_recorded", "shipment_id", "recorded_at"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    shipment_id: Mapped[str] = mapped_column(ForeignKey("shipments.id", ondelete="CASCADE"), index=True)
    driver_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    accuracy_meters: Mapped[float | None] = mapped_column(Float)
    speed_kmh: Mapped[float | None] = mapped_column(Float)
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, index=True)


class RerouteAudit(Base):
    __tablename__ = "reroute_audits"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    shipment_id: Mapped[str] = mapped_column(ForeignKey("shipments.id", ondelete="CASCADE"), index=True)
    actor_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    original_destination: Mapped[str] = mapped_column(String(240))
    recommended_destination: Mapped[str] = mapped_column(String(240))
    reason: Mapped[str] = mapped_column(Text)
    approved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)


class BusinessProfile(Base):
    __tablename__ = "business_profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True)
    legal_name: Mapped[str] = mapped_column(String(180))
    business_type: Mapped[str] = mapped_column(String(48))
    gst_number: Mapped[str | None] = mapped_column(String(15), unique=True)
    address: Mapped[str] = mapped_column(String(500))
    contact_phone: Mapped[str | None] = mapped_column(String(32))
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)


class BusinessLocation(Base):
    __tablename__ = "business_locations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    business_id: Mapped[str] = mapped_column(ForeignKey("business_profiles.id", ondelete="CASCADE"), index=True)
    label: Mapped[str] = mapped_column(String(80))
    address: Mapped[str] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)


class BusinessListing(Base):
    __tablename__ = "business_listings"
    __table_args__ = (Index("ix_business_listings_status_crop", "status", "crop"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    seller_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    crop: Mapped[str] = mapped_column(String(80), index=True)
    market_category_id: Mapped[str | None] = mapped_column(String(32), index=True)
    variety: Mapped[str] = mapped_column(String(120), default="")
    grade: Mapped[str] = mapped_column(String(80))
    quantity_kg: Mapped[float] = mapped_column(Float)
    available_quantity_kg: Mapped[float] = mapped_column(Float)
    minimum_order_kg: Mapped[float] = mapped_column(Float, default=1)
    price_per_kg: Mapped[float] = mapped_column(Float)
    pickup_location: Mapped[str] = mapped_column(String(240))
    status: Mapped[str] = mapped_column(String(24), default="OPEN", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)


class BusinessOrder(Base):
    __tablename__ = "business_orders"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    listing_id: Mapped[str] = mapped_column(ForeignKey("business_listings.id"), index=True)
    buyer_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    seller_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    quantity_kg: Mapped[float] = mapped_column(Float)
    current_offer_per_kg: Mapped[float] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(24), default="NEGOTIATING", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)


class BusinessNegotiationEvent(Base):
    __tablename__ = "business_negotiation_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    order_id: Mapped[str] = mapped_column(ForeignKey("business_orders.id", ondelete="CASCADE"), index=True)
    actor_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    price_per_kg: Mapped[float] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)


class TransportRequest(Base):
    __tablename__ = "business_transport_requests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    requester_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    shipment_id: Mapped[str | None] = mapped_column(ForeignKey("shipments.id", ondelete="SET NULL"), index=True)
    pickup: Mapped[str] = mapped_column(String(240))
    destination: Mapped[str] = mapped_column(String(240))
    quantity_kg: Mapped[float] = mapped_column(Float)
    preferred_vehicle_type: Mapped[str | None] = mapped_column(String(48))
    cargo_volume_m3: Mapped[float | None] = mapped_column(Float)
    refrigerated: Mapped[bool] = mapped_column(Boolean, default=False)
    truck_count: Mapped[int] = mapped_column(Integer)
    delivery_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    status: Mapped[str] = mapped_column(String(24), default="OPEN", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)


class TransportQuote(Base):
    __tablename__ = "business_transport_quotes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    request_id: Mapped[str] = mapped_column(ForeignKey("business_transport_requests.id", ondelete="CASCADE"), index=True)
    carrier_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    vehicle_type: Mapped[str] = mapped_column(String(48), default="unspecified")
    refrigerated: Mapped[bool] = mapped_column(Boolean, default=False)
    price_inr: Mapped[float] = mapped_column(Float)
    vehicle_count: Mapped[int] = mapped_column(Integer)
    estimated_hours: Mapped[float] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(24), default="SUBMITTED", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)


class VehicleAvailability(Base):
    __tablename__ = "vehicle_availability"
    __table_args__ = (Index("ix_vehicle_availability_area_status_departure", "pickup_area", "status", "departure_time"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    driver_id: Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    vehicle_number: Mapped[str] = mapped_column(String(32), index=True)
    vehicle_type: Mapped[str] = mapped_column(String(48), index=True)
    current_location: Mapped[str] = mapped_column(String(240))
    pickup_area: Mapped[str] = mapped_column(String(120), index=True)
    destination: Mapped[str] = mapped_column(String(120), index=True)
    route: Mapped[str] = mapped_column(String(500), default="")
    available_capacity: Mapped[float] = mapped_column(Float)
    total_capacity: Mapped[float] = mapped_column(Float)
    rate_inr: Mapped[float] = mapped_column(Float)
    refrigerated: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    departure_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    estimated_arrival_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    status: Mapped[str] = mapped_column(String(24), default="AVAILABLE", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)


class VehicleBooking(Base):
    __tablename__ = "vehicle_bookings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    vehicle_id: Mapped[str] = mapped_column(ForeignKey("vehicle_availability.id", ondelete="CASCADE"), index=True)
    requester_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    shipment_id: Mapped[str | None] = mapped_column(ForeignKey("shipments.id", ondelete="SET NULL"), index=True)
    requested_capacity_kg: Mapped[float] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(24), default="CONFIRMED", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)


class VehicleNotification(Base):
    __tablename__ = "vehicle_notifications"
    __table_args__ = (Index("ix_vehicle_notifications_user_created", "user_id", "created_at"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    vehicle_id: Mapped[str] = mapped_column(ForeignKey("vehicle_availability.id", ondelete="CASCADE"), index=True)
    event_type: Mapped[str] = mapped_column(String(32), index=True)
    title: Mapped[str] = mapped_column(String(120))
    message: Mapped[str] = mapped_column(String(500))
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, index=True)


class InsuranceApplication(Base):
    __tablename__ = "insurance_applications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    farmer_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    shipment_id: Mapped[str | None] = mapped_column(ForeignKey("shipments.id"), index=True)
    crop: Mapped[str] = mapped_column(String(80))
    coverage_type: Mapped[str] = mapped_column(String(32))
    insured_value_inr: Mapped[float] = mapped_column(Float)
    requested_coverage_inr: Mapped[float] = mapped_column(Float)
    origin: Mapped[str] = mapped_column(String(240))
    destination: Mapped[str] = mapped_column(String(240))
    harvest_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    notes: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(24), default="PENDING_REVIEW", index=True)
    review_notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)