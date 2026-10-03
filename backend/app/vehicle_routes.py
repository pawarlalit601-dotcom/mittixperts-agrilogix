import re
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import ensure_verified_kyc, get_current_user
from app.business_routes import require_verified_business
from app.models import User, VehicleAvailability, VehicleBooking, VehicleNotification
from app.schemas import (
    VehicleAvailabilityCreate,
    VehicleAvailabilityRead,
    VehicleAvailabilityUpdate,
    VehicleBookingCreate,
    VehicleBookingRead,
    VehicleNotificationRead,
)


router = APIRouter(prefix="/api/v1/vehicle-availability", tags=["vehicle availability"])
AREA_ALIASES = {
    "bangalore": "bengaluru",
    "bengaluru": "bengaluru",
    "bombay": "mumbai",
    "mumbai": "mumbai",
    "madras": "chennai",
    "chennai": "chennai",
    "calcutta": "kolkata",
    "kolkata": "kolkata",
}


def _area_key(value: str) -> str:
    normalized = re.sub(r"[^a-z0-9]+", " ", value.casefold()).strip()
    for alias, canonical in AREA_ALIASES.items():
        if alias in normalized.split():
            return re.sub(rf"\b{re.escape(alias)}\b", canonical, normalized)
    return normalized


def _same_area(selected: str, candidate: str) -> bool:
    selected_key = _area_key(selected)
    candidate_key = _area_key(candidate)
    return bool(selected_key and candidate_key and (selected_key == candidate_key or selected_key in candidate_key or candidate_key in selected_key))


def _provider_profile(db: Session, user: User) -> None:
    if user.role == "DRIVER":
        ensure_verified_kyc(user)
        return
    if user.role == "BUSINESS":
        require_verified_business(db, user, "Transport Company")
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Vehicle availability is for verified transport providers")


def _capacity_status(available: float, total: float) -> str:
    if available <= 0:
        return "FULL"
    if available / total <= 0.25:
        return "FILLING_FAST"
    return "AVAILABLE"


def _matching_users(db: Session, pickup_area: str, owner_id: str) -> list[User]:
    users = db.scalars(
        select(User).where(User.is_active.is_(True), User.role.in_(("FARMER", "BUYER")))
    ).all()
    return [
        user for user in users
        if user.id != owner_id and (
            (user.preferred_pickup_area and _same_area(pickup_area, user.preferred_pickup_area))
            or (user.service_area and _same_area(pickup_area, user.service_area))
        )
    ]


def _notify_area(
    db: Session,
    vehicle: VehicleAvailability,
    event_type: str,
    title: str,
    message: str,
) -> None:
    for user in _matching_users(db, vehicle.pickup_area, vehicle.owner_id):
        db.add(VehicleNotification(
            user_id=user.id,
            vehicle_id=vehicle.id,
            event_type=event_type,
            title=title,
            message=message[:500],
        ))


def _vehicle_read(vehicle: VehicleAvailability) -> VehicleAvailabilityRead:
    return VehicleAvailabilityRead.model_validate(vehicle)


@router.post("", response_model=VehicleAvailabilityRead, status_code=status.HTTP_201_CREATED)
def create_vehicle_availability(
    payload: VehicleAvailabilityCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> VehicleAvailabilityRead:
    _provider_profile(db, user)
    driver_id = payload.driver_id
    if user.role == "DRIVER":
        if driver_id and driver_id != user.id:
            raise HTTPException(status_code=403, detail="Drivers can publish only their own vehicle")
        driver_id = user.id
    elif driver_id:
        driver = db.get(User, driver_id)
        if driver is None or driver.role != "DRIVER" or driver.transporter_id != user.id:
            raise HTTPException(status_code=422, detail="Choose a driver assigned to this transport company")

    vehicle = VehicleAvailability(
        owner_id=user.id,
        driver_id=driver_id,
        vehicle_number=payload.vehicle_number.strip().upper(),
        vehicle_type=payload.vehicle_type,
        current_location=payload.current_location.strip(),
        pickup_area=payload.pickup_area.strip(),
        destination=payload.destination.strip(),
        route=payload.route.strip(),
        available_capacity=payload.available_capacity,
        total_capacity=payload.total_capacity,
        rate_inr=payload.rate_inr,
        refrigerated=payload.refrigerated,
        departure_time=payload.departure_time,
        estimated_arrival_time=payload.estimated_arrival_time,
        status=_capacity_status(payload.available_capacity, payload.total_capacity),
    )
    db.add(vehicle)
    db.flush()
    if vehicle.status in {"AVAILABLE", "FILLING_FAST"}:
        _notify_area(
            db,
            vehicle,
            "NEW_VEHICLE",
            "New vehicle available",
            f"{vehicle.vehicle_number}: {vehicle.pickup_area} to {vehicle.destination}, {vehicle.available_capacity:g} t available, departure {vehicle.departure_time.strftime('%I:%M %p')}.",
        )
    db.commit()
    db.refresh(vehicle)
    return _vehicle_read(vehicle)


@router.get("/mine", response_model=list[VehicleAvailabilityRead])
def list_my_vehicle_availability(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[VehicleAvailabilityRead]:
    _provider_profile(db, user)
    vehicles = db.scalars(
        select(VehicleAvailability).where(VehicleAvailability.owner_id == user.id).order_by(VehicleAvailability.updated_at.desc())
    ).all()
    return [_vehicle_read(vehicle) for vehicle in vehicles]


@router.get("", response_model=list[VehicleAvailabilityRead])
def search_vehicle_availability(
    pickup_area: str | None = Query(default=None, min_length=2, max_length=120),
    destination: str | None = Query(default=None, min_length=2, max_length=120),
    required_capacity_kg: float | None = Query(default=None, gt=0, le=100_000),
    refrigerated: bool | None = None,
    vehicle_type: str | None = Query(default=None, min_length=2, max_length=48),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[VehicleAvailabilityRead]:
    if user.role not in {"FARMER", "BUYER", "ADMIN"}:
        raise HTTPException(status_code=403, detail="Vehicle search is not available for this account")
    selected_area = (pickup_area or user.preferred_pickup_area or user.service_area or "").strip()
    if not selected_area:
        raise HTTPException(status_code=422, detail="Select a pickup area to find nearby vehicles")

    statement = select(VehicleAvailability).where(
        VehicleAvailability.status.in_(("AVAILABLE", "FILLING_FAST")),
        VehicleAvailability.available_capacity > 0,
        VehicleAvailability.departure_time >= datetime.now(UTC),
    )
    vehicles = db.scalars(statement).all()
    candidates = []
    requested_destination = _area_key(destination) if destination else ""
    for vehicle in vehicles:
        if not (_same_area(selected_area, vehicle.pickup_area) or _same_area(selected_area, vehicle.current_location)):
            continue
        if requested_destination:
            route_destination = _area_key(f"{vehicle.destination} {vehicle.route}")
            if requested_destination not in route_destination and _area_key(vehicle.destination) not in requested_destination:
                continue
        if required_capacity_kg and vehicle.available_capacity * 1000 < required_capacity_kg:
            continue
        if vehicle_type and vehicle.vehicle_type != vehicle_type:
            continue
        if refrigerated is True and not vehicle.refrigerated:
            continue
        route_rank = 0 if requested_destination and _area_key(vehicle.destination) == requested_destination else 1
        capacity_fit = vehicle.available_capacity * 1000 - (required_capacity_kg or 0)
        departure = vehicle.departure_time
        if departure.tzinfo is None:
            departure = departure.replace(tzinfo=UTC)
        status_rank = 0 if vehicle.status == "AVAILABLE" else 1
        candidates.append(((route_rank, capacity_fit, departure, status_rank), vehicle))
    candidates.sort(key=lambda item: item[0])
    return [_vehicle_read(vehicle) for _, vehicle in candidates]


@router.patch("/{vehicle_id}", response_model=VehicleAvailabilityRead)
def update_vehicle_availability(
    vehicle_id: str,
    payload: VehicleAvailabilityUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> VehicleAvailabilityRead:
    vehicle = db.get(VehicleAvailability, vehicle_id)
    if vehicle is None or (user.role != "ADMIN" and vehicle.owner_id != user.id):
        raise HTTPException(status_code=404, detail="Vehicle availability not found")
    if user.role != "ADMIN":
        _provider_profile(db, user)
    if vehicle.status in {"DEPARTED", "CANCELLED"}:
        raise HTTPException(status_code=409, detail="Departed or cancelled vehicles cannot be changed")

    old_departure = vehicle.departure_time
    old_destination = vehicle.destination
    values = payload.model_dump(exclude_unset=True, exclude={"status"})
    for field, value in values.items():
        if value is not None:
            setattr(vehicle, field, value.strip() if isinstance(value, str) else value)
    if payload.status:
        vehicle.status = payload.status
    elif payload.available_capacity is not None:
        vehicle.status = _capacity_status(vehicle.available_capacity, vehicle.total_capacity)
    if payload.status == "DEPARTED":
        _notify_area(db, vehicle, "VEHICLE_DEPARTED", "Vehicle departed", f"{vehicle.vehicle_number} has departed from {vehicle.pickup_area}.")
    elif payload.status == "CANCELLED":
        _notify_area(db, vehicle, "VEHICLE_CANCELLED", "Vehicle cancelled", f"{vehicle.vehicle_number} from {vehicle.pickup_area} is no longer available.")
    elif vehicle.departure_time != old_departure:
        _notify_area(db, vehicle, "DEPARTURE_CHANGED", "Vehicle departure updated", f"{vehicle.vehicle_number} now departs at {vehicle.departure_time.strftime('%I:%M %p')}.")
    elif vehicle.destination != old_destination:
        _notify_area(db, vehicle, "ROUTE_CHANGED", "Vehicle route updated", f"{vehicle.vehicle_number} now travels to {vehicle.destination}.")
    db.commit()
    db.refresh(vehicle)
    return _vehicle_read(vehicle)


@router.post("/{vehicle_id}/book", response_model=VehicleBookingRead, status_code=status.HTTP_201_CREATED)
def book_vehicle_capacity(
    vehicle_id: str,
    payload: VehicleBookingCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> VehicleBookingRead:
    if user.role != "FARMER":
        raise HTTPException(status_code=403, detail="Only farmers can book a vehicle")
    ensure_verified_kyc(user)
    vehicle = db.get(VehicleAvailability, vehicle_id)
    if vehicle is None or vehicle.status not in {"AVAILABLE", "FILLING_FAST"}:
        raise HTTPException(status_code=404, detail="Vehicle is no longer available")
    if payload.requested_capacity_kg > vehicle.available_capacity * 1000:
        raise HTTPException(status_code=409, detail="The remaining vehicle capacity is too small")
    if payload.shipment_id:
        shipment = db.get(Shipment, payload.shipment_id)
        if shipment is None or shipment.farmer_id != user.id:
            raise HTTPException(status_code=404, detail="Shipment not found")
    booking = VehicleBooking(
        vehicle_id=vehicle.id,
        requester_id=user.id,
        shipment_id=payload.shipment_id,
        requested_capacity_kg=payload.requested_capacity_kg,
        status="CONFIRMED",
    )
    previous_status = vehicle.status
    vehicle.available_capacity -= payload.requested_capacity_kg / 1000
    vehicle.status = _capacity_status(vehicle.available_capacity, vehicle.total_capacity)
    db.add(booking)
    db.flush()
    db.add(VehicleNotification(
        user_id=vehicle.owner_id,
        vehicle_id=vehicle.id,
        event_type="BOOKING_CONFIRMED",
        title="Vehicle capacity booked",
        message=f"{payload.requested_capacity_kg:g} kg has been booked on {vehicle.vehicle_number}. {vehicle.available_capacity:g} t remains.",
    ))
    if vehicle.status != previous_status and vehicle.status == "FILLING_FAST":
        _notify_area(db, vehicle, "FILLING_FAST", "Vehicle filling fast", f"Only {vehicle.available_capacity:g} t remains on {vehicle.vehicle_number}.")
    db.commit()
    db.refresh(booking)
    return VehicleBookingRead.model_validate(booking)


@router.get("/notifications", response_model=list[VehicleNotificationRead])
def list_vehicle_notifications(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[VehicleNotificationRead]:
    alerts = db.scalars(
        select(VehicleNotification).where(VehicleNotification.user_id == user.id).order_by(VehicleNotification.created_at.desc()).limit(50)
    ).all()
    return [VehicleNotificationRead.model_validate(alert) for alert in alerts]


@router.post("/notifications/{notification_id}/read", response_model=VehicleNotificationRead)
def mark_vehicle_notification_read(
    notification_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> VehicleNotificationRead:
    notification = db.get(VehicleNotification, notification_id)
    if notification is None or notification.user_id != user.id:
        raise HTTPException(status_code=404, detail="Vehicle notification not found")
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return VehicleNotificationRead.model_validate(notification)