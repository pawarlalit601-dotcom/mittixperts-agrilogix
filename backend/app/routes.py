import asyncio
import secrets
from collections import defaultdict
from datetime import UTC, datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Response, WebSocket, WebSocketDisconnect, status
from google.auth.exceptions import GoogleAuthError
from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2 import id_token as google_id_token
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import SessionLocal, get_db
from app.deps import ensure_verified_kyc, get_current_user, get_optional_current_user, require_roles
from app.kyc_routes import seed_registration_profile
from app.models import BusinessProfile, InsuranceApplication, RerouteAudit, Shipment, ShipmentLocation, User, UserActivity
from app.schemas import (
    AssignDriverRequest,
    AuthResponse,
    LocationCreate,
    LocationRead,
    InsuranceApplicationCreate,
    InsuranceApplicationRead,
    InsuranceApplicationReview,
    GoogleAuthRequest,
    LoginRequest,
    RegisterRequest,
    RerouteAuditRead,
    RerouteRequest,
    ShipmentCreate,
    ShipmentRead,
    UserRead,
    UserPreferencesUpdate,
)
from app.security import create_access_token, decode_access_token, hash_password, verify_password


api = APIRouter(prefix="/api/v1")
auth_router = APIRouter(prefix="/auth", tags=["authentication"])
shipment_router = APIRouter(prefix="/shipments", tags=["shipments"])
settings = get_settings()


def registered_account_type(payload: RegisterRequest) -> str:
    if payload.account_type:
        return payload.account_type
    if payload.role in {"FARMER", "DRIVER"}:
        return payload.role
    if payload.role == "BUSINESS":
        return {
            "Transport Company": "TRANSPORTER",
            "Wholesaler": "WHOLESALER",
            "Retailer": "RETAILER",
            "Farmer Group / FPO": "FPO",
        }.get(payload.business_type or "", "BUYER_BUSINESS")
    return "BUYER_BUSINESS"


def set_session_cookie(response: Response, user_id: str) -> None:
    response.set_cookie(
        "access_token",
        create_access_token(user_id),
        max_age=settings.jwt_access_token_minutes * 60,
        httponly=True,
        secure=settings.secure_cookies,
        samesite="lax",
        path="/",
    )


def record_user_activity(
    *,
    user_id: str | None,
    action: str,
    route: str | None = None,
    method: str | None = None,
    status_code: int | None = None,
    details: str | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
) -> None:
    if not action:
        return
    try:
        with SessionLocal() as activity_db:
            activity_db.add(
                UserActivity(
                    user_id=user_id,
                    action=action[:64],
                    route=(route or "")[:200],
                    method=(method or "")[:16],
                    status_code=status_code,
                    ip_address=(ip_address or "")[:64],
                    user_agent=(user_agent or "")[:240],
                    details=(details or "")[:2000],
                )
            )
            activity_db.commit()
    except Exception:
        pass


@auth_router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> User:
    user = User(
        email=payload.email.lower(),
        full_name=payload.full_name.strip(),
        password_hash=hash_password(payload.password),
        role=payload.role,
        account_type=registered_account_type(payload),
        preferred_language=payload.preferred_language,
        mobile_number=payload.mobile_number,
            service_area=payload.district or payload.state,
            preferred_pickup_area=payload.village or payload.district,
    )
    try:
        db.add(user)
        db.flush()
        if payload.village or payload.district or payload.state:
            seed_registration_profile(db, user, {
                "village": payload.village,
                "district": payload.district,
                "state": payload.state,
            })
        if payload.role == "BUSINESS" and payload.company_name and payload.business_type and payload.business_address:
            db.add(BusinessProfile(
                user_id=user.id,
                legal_name=payload.company_name or "",
                business_type=payload.business_type or "",
                gst_number=payload.gst_number,
                address=payload.business_address or "",
                contact_phone=payload.contact_phone,
            ))
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email or GSTIN is already registered") from exc
    db.refresh(user)
    record_user_activity(
        user_id=user.id,
        action="REGISTER",
        route="/api/v1/auth/register",
        method="POST",
        status_code=201,
        details=f"registered as {user.role}",
    )
    return user


@auth_router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)) -> AuthResponse:
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    valid_password = verify_password(payload.password, user.password_hash) if user else False
    if not user or not valid_password or not user.is_active:
        record_user_activity(
            user_id=user.id if user else None,
            action="LOGIN_FAILED",
            route="/api/v1/auth/login",
            method="POST",
            status_code=401,
            details=f"failed login for {payload.email.lower()}",
        )
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    set_session_cookie(response, user.id)
    record_user_activity(
        user_id=user.id,
        action="LOGIN",
        route="/api/v1/auth/login",
        method="POST",
        status_code=200,
        details=f"logged in as {user.role}",
    )
    return AuthResponse(user=UserRead.model_validate(user))


@auth_router.post("/google", response_model=AuthResponse)
def google_login(payload: GoogleAuthRequest, response: Response, db: Session = Depends(get_db)) -> AuthResponse:
    if not settings.google_client_id:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Google sign-in is not configured")
    try:
        claims = google_id_token.verify_oauth2_token(
            payload.credential,
            GoogleRequest(),
            settings.google_client_id,
        )
    except (GoogleAuthError, ValueError) as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google credential") from exc

    email = claims.get("email")
    if claims.get("email_verified") is not True or not isinstance(email, str) or not claims.get("sub"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="A verified Google email is required")

    normalized_email = email.lower()
    user = db.scalar(select(User).where(User.email == normalized_email))
    if user is None:
        user = User(
            email=normalized_email,
            full_name=str(claims.get("name") or normalized_email.split("@", maxsplit=1)[0])[:120],
            password_hash=hash_password(secrets.token_urlsafe(48)),
            role="FARMER",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This account is disabled")

    set_session_cookie(response, user.id)
    return AuthResponse(user=UserRead.model_validate(user))


@auth_router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response, user: User = Depends(get_current_user)) -> Response:
    if user:
        record_user_activity(
            user_id=user.id,
            action="LOGOUT",
            route="/api/v1/auth/logout",
            method="POST",
            status_code=204,
            details="user signed out",
        )
    response.delete_cookie("access_token", path="/", httponly=True, secure=settings.secure_cookies, samesite="lax")
    response.status_code = status.HTTP_204_NO_CONTENT
    return response


@auth_router.get("/me", response_model=UserRead | None)
def current_user(user: User | None = Depends(get_optional_current_user)) -> User | None:
    if user:
        record_user_activity(
            user_id=user.id,
            action="PROFILE_VIEW",
            route="/api/v1/auth/me",
            method="GET",
            status_code=200,
            details="user fetched session profile",
        )
    return user


@auth_router.patch("/profile", response_model=UserRead)
def update_user_profile(
    payload: UserPreferencesUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> User:
    user.preferred_language = payload.preferred_language
    db.commit()
    db.refresh(user)
    record_user_activity(
        user_id=user.id,
        action="PROFILE_UPDATED",
        route="/api/v1/auth/profile",
        method="PATCH",
        status_code=200,
        details=f"updated language to {user.preferred_language}",
    )
    return user


@auth_router.patch("/preferences", response_model=UserRead)
def update_user_preferences(
    payload: UserPreferencesUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> User:
    user.preferred_language = payload.preferred_language
    db.commit()
    db.refresh(user)
    record_user_activity(
        user_id=user.id,
        action="PREFERENCES_UPDATED",
        route="/api/v1/auth/preferences",
        method="PATCH",
        status_code=200,
        details=f"updated language to {user.preferred_language}",
    )
    return user


@shipment_router.post("", response_model=ShipmentRead, status_code=status.HTTP_201_CREATED)
def create_shipment(
    payload: ShipmentCreate,
    db: Session = Depends(get_db),
    farmer: User = Depends(require_roles("FARMER")),
) -> Shipment:
    ensure_verified_kyc(farmer)
    shipment = Shipment(
        tracking_number=f"KS-{datetime.now(UTC):%Y%m%d}-{uuid4().hex[:10].upper()}",
        farmer_id=farmer.id,
        crop=payload.crop,
        variety=payload.variety,
        quantity_kg=payload.quantity_kg,
        vehicle_type=payload.vehicle_type,
        cargo_volume_m3=payload.cargo_volume_m3,
        harvest_at=payload.harvest_at,
        expected_shelf_life_hours=payload.expected_shelf_life_hours,
        quality_grade=payload.quality_grade,
        storage_condition=payload.storage_condition,
        origin=payload.origin,
        destination=payload.destination,
        status="CREATED",
    )
    db.add(shipment)
    db.commit()
    db.refresh(shipment)
    return shipment


@shipment_router.get("", response_model=list[ShipmentRead])
def list_shipments(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[Shipment]:
    if user.role == "ADMIN":
        statement = select(Shipment)
    elif user.role == "FARMER":
        statement = select(Shipment).where(Shipment.farmer_id == user.id)
    elif user.role == "DRIVER":
        statement = select(Shipment).where(Shipment.driver_id == user.id)
    else:
        statement = select(Shipment).where(Shipment.buyer_id == user.id)
    return list(db.scalars(statement.order_by(Shipment.created_at.desc())).all())


def get_shipment_for_user(shipment_id: str, user: User, db: Session) -> Shipment:
    shipment = db.get(Shipment, shipment_id)
    if shipment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shipment not found")
    if user.role != "ADMIN" and user.id not in {shipment.farmer_id, shipment.driver_id, shipment.buyer_id}:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shipment not found")
    return shipment


@shipment_router.get("/{shipment_id}", response_model=ShipmentRead)
def read_shipment(
    shipment_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Shipment:
    return get_shipment_for_user(shipment_id, user, db)


@shipment_router.post("/{shipment_id}/driver", response_model=ShipmentRead)
def assign_driver(
    shipment_id: str,
    payload: AssignDriverRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles("ADMIN")),
) -> Shipment:
    del admin
    shipment = db.get(Shipment, shipment_id)
    driver = db.get(User, payload.driver_id)
    if shipment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shipment not found")
    if driver is None or driver.role != "DRIVER" or not driver.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="An active driver account is required")
    ensure_verified_kyc(driver)
    shipment.driver_id = driver.id
    shipment.status = "TRANSPORT_SELECTED"
    db.commit()
    db.refresh(shipment)
    return shipment


@shipment_router.post("/{shipment_id}/reroutes", response_model=RerouteAuditRead, status_code=status.HTTP_201_CREATED)
def confirm_reroute(
    shipment_id: str,
    payload: RerouteRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("FARMER", "ADMIN")),
) -> RerouteAudit:
    ensure_verified_kyc(user)
    shipment = get_shipment_for_user(shipment_id, user, db)
    original_destination = shipment.destination
    event = RerouteAudit(
        shipment_id=shipment.id,
        actor_id=user.id,
        original_destination=original_destination,
        recommended_destination=payload.destination,
        reason=payload.reason,
    )
    shipment.destination = payload.destination
    shipment.status = "REROUTED"
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@shipment_router.post("/{shipment_id}/locations", response_model=LocationRead, status_code=status.HTTP_201_CREATED)
async def publish_location(
    shipment_id: str,
    payload: LocationCreate,
    db: Session = Depends(get_db),
    driver: User = Depends(require_roles("DRIVER")),
) -> ShipmentLocation:
    ensure_verified_kyc(driver)
    shipment = db.get(Shipment, shipment_id)
    if shipment is None or shipment.driver_id != driver.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assigned shipment not found")
    location = ShipmentLocation(
        shipment_id=shipment.id,
        driver_id=driver.id,
        latitude=payload.latitude,
        longitude=payload.longitude,
        accuracy_meters=payload.accuracy_meters,
        speed_kmh=payload.speed_kmh,
        recorded_at=datetime.now(UTC),
    )
    db.add(location)
    db.commit()
    db.refresh(location)
    await location_connections.broadcast(shipment_id, LocationRead.model_validate(location).model_dump(mode="json", by_alias=True))
    return location


@shipment_router.get("/{shipment_id}/locations/latest", response_model=LocationRead)
def latest_location(
    shipment_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ShipmentLocation:
    shipment = db.get(Shipment, shipment_id)
    if shipment is None or user.role not in {"ADMIN", "FARMER", "DRIVER"}:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shipment location not found")
    if user.role == "FARMER" and shipment.farmer_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shipment location not found")
    if user.role == "DRIVER" and shipment.driver_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shipment location not found")
    location = db.scalar(
        select(ShipmentLocation)
        .where(ShipmentLocation.shipment_id == shipment_id)
        .order_by(ShipmentLocation.recorded_at.desc())
        .limit(1)
    )
    if location is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No driver location has been published")
    return location


@api.post("/insurance/applications", response_model=InsuranceApplicationRead, status_code=status.HTTP_201_CREATED)
def create_insurance_application(
    payload: InsuranceApplicationCreate,
    db: Session = Depends(get_db),
    farmer: User = Depends(require_roles("FARMER")),
) -> InsuranceApplication:
    if payload.requested_coverage_inr > payload.insured_value_inr:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Requested coverage exceeds declared cargo value")
    if payload.shipment_id:
        shipment = get_shipment_for_user(payload.shipment_id, farmer, db)
        if shipment.farmer_id != farmer.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shipment not found")
    application = InsuranceApplication(farmer_id=farmer.id, **payload.model_dump())
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


@api.get("/insurance/applications", response_model=list[InsuranceApplicationRead])
def list_insurance_applications(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[InsuranceApplication]:
    statement = select(InsuranceApplication)
    if user.role != "ADMIN":
        if user.role != "FARMER":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insurance application access denied")
        statement = statement.where(InsuranceApplication.farmer_id == user.id)
    return list(db.scalars(statement.order_by(InsuranceApplication.created_at.desc())).all())


@api.patch("/insurance/applications/{application_id}", response_model=InsuranceApplicationRead)
def review_insurance_application(
    application_id: str,
    payload: InsuranceApplicationReview,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles("ADMIN")),
) -> InsuranceApplication:
    del admin
    application = db.get(InsuranceApplication, application_id)
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Insurance application not found")
    application.status = payload.status
    application.review_notes = payload.review_notes
    db.commit()
    db.refresh(application)
    return application


class LocationConnections:
    def __init__(self) -> None:
        self._connections: dict[str, set[WebSocket]] = defaultdict(set)
        self._lock = asyncio.Lock()

    async def connect(self, shipment_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        async with self._lock:
            self._connections[shipment_id].add(websocket)

    async def disconnect(self, shipment_id: str, websocket: WebSocket) -> None:
        async with self._lock:
            self._connections[shipment_id].discard(websocket)
            if not self._connections[shipment_id]:
                self._connections.pop(shipment_id, None)

    async def broadcast(self, shipment_id: str, message: dict[str, object]) -> None:
        async with self._lock:
            connections = tuple(self._connections.get(shipment_id, ()))
        stale: list[WebSocket] = []
        for websocket in connections:
            try:
                await websocket.send_json(message)
            except Exception:
                stale.append(websocket)
        for websocket in stale:
            await self.disconnect(shipment_id, websocket)


location_connections = LocationConnections()


@api.websocket("/ws/shipments/{shipment_id}/locations")
async def shipment_location_stream(websocket: WebSocket, shipment_id: str) -> None:
    token = websocket.cookies.get("access_token")
    user_id = decode_access_token(token) if token else None
    if user_id is None:
        await websocket.close(code=4401)
        return
    with SessionLocal() as db:
        user = db.get(User, user_id)
        shipment = db.get(Shipment, shipment_id)
        authorized = bool(
            user
            and user.is_active
            and shipment
            and (
                user.role == "ADMIN"
                or user.id == shipment.farmer_id
                or user.id == shipment.driver_id
            )
        )
    if not authorized:
        await websocket.close(code=4404)
        return
    await location_connections.connect(shipment_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        await location_connections.disconnect(shipment_id, websocket)


api.include_router(auth_router)
api.include_router(shipment_router)