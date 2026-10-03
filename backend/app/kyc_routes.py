import json
import re
import secrets
from datetime import UTC, datetime, timedelta, time
from pathlib import Path
from typing import Annotated
from uuid import uuid4

from cryptography.exceptions import InvalidTag
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.deps import get_current_user, require_roles
from app.kyc_security import decrypt_private_data, encrypt_private_data, private_document_path
from app.models import (
    BusinessProfile,
    KycApplication,
    KycAuditEvent,
    KycDocument,
    KycDocumentAccessLog,
    KycVehicle,
    User,
)
from app.schemas import (
    KycApplicationRead,
    KycApplicationSummaryRead,
    KycDocumentRead,
    KycDocumentReviewRequest,
    KycVehicleAdminRead,
    KycProfileUpdate,
    KycReviewRequest,
    KycVehicleCreate,
    KycVehicleRead,
    DriverTransporterAssignment,
    VerifiedTransporterRead,
)


router = APIRouter(prefix="/api/v1/kyc", tags=["KYC verification"])

ACCOUNT_TYPES = {"FARMER", "TRANSPORTER", "DRIVER", "WHOLESALER", "RETAILER", "FPO", "BUYER_BUSINESS"}
BUSINESS_ACCOUNT_TYPES = {"TRANSPORTER", "WHOLESALER", "RETAILER", "FPO", "BUYER_BUSINESS"}
BUSINESS_TYPES = {
    "TRANSPORTER": "Transport Company",
    "WHOLESALER": "Wholesaler",
    "RETAILER": "Retailer",
    "FPO": "Farmer Group / FPO",
    "BUYER_BUSINESS": "Agricultural Business",
}
REQUIRED_PROFILE_FIELDS = {
    "FARMER": ("fullName", "mobileNumber", "dateOfBirth", "address", "village", "taluka", "district", "state", "pinCode", "farmLocation", "landArea", "landTenure", "majorCrops", "expectedProduction", "availableHarvestPeriod", "preferredMarkets"),
    "TRANSPORTER": ("businessName", "ownerName", "mobileNumber", "registeredAddress", "operatingLocations", "yearsInBusiness", "vehicleCount", "vehicleTypes", "totalCapacity", "serviceRoutes", "commoditiesHandled"),
    "DRIVER": ("fullName", "mobileNumber", "address", "emergencyContact", "transporterName", "drivingLicenceNumber", "licenceType", "licenceExpiresAt"),
    "WHOLESALER": ("businessName", "ownerName", "mobileNumber", "businessAddress", "warehouseAddress", "operatingMarkets", "commoditiesHandled", "storageCapacity", "coldStorageAvailable"),
    "RETAILER": ("businessName", "ownerName", "mobileNumber", "shopAddress", "deliveryAddress", "operatingArea", "productCategories", "weeklyDemand", "deliveryRequirements"),
    "FPO": ("businessName", "registrationNumber", "authorizedPerson", "mobileNumber", "registeredAddress", "farmerCount", "mainCrops", "productionCapacity"),
    "BUYER_BUSINESS": ("businessName", "ownerName", "mobileNumber", "businessAddress", "operatingMarkets", "commoditiesHandled"),
}
REQUIRED_DOCUMENTS = {
    "FARMER": {"IDENTITY", "BANK_PROOF"},
    "TRANSPORTER": {"BUSINESS_REGISTRATION", "BANK_PROOF", "AUTHORIZED_SIGNATORY_ID"},
    "DRIVER": {"IDENTITY", "DRIVING_LICENCE", "ADDRESS_PROOF"},
    "WHOLESALER": {"BUSINESS_REGISTRATION", "BANK_PROOF", "AUTHORIZED_SIGNATORY_ID"},
    "RETAILER": {"IDENTITY", "BUSINESS_REGISTRATION"},
    "FPO": {"ORGANIZATION_REGISTRATION", "BANK_PROOF", "AUTHORIZED_SIGNATORY_ID"},
    "BUYER_BUSINESS": {"BUSINESS_REGISTRATION", "BANK_PROOF", "AUTHORIZED_SIGNATORY_ID"},
}
DOCUMENT_TYPES = {
    "IDENTITY", "AADHAAR", "PAN", "BANK_PROOF", "BUSINESS_REGISTRATION", "GST_CERTIFICATE",
    "AUTHORIZED_SIGNATORY_ID", "DRIVING_LICENCE", "ADDRESS_PROOF", "ORGANIZATION_REGISTRATION",
    "VEHICLE_RC", "VEHICLE_INSURANCE", "VEHICLE_FITNESS", "VEHICLE_PERMIT",
    "VEHICLE_POLLUTION", "PROFILE_PHOTO", "OTHER",
}
VEHICLE_DOCUMENT_TYPES = {"VEHICLE_RC", "VEHICLE_INSURANCE", "VEHICLE_FITNESS", "VEHICLE_PERMIT", "VEHICLE_POLLUTION"}
REQUIRED_VEHICLE_DOCUMENTS = {"VEHICLE_RC", "VEHICLE_INSURANCE", "VEHICLE_FITNESS", "VEHICLE_PERMIT", "VEHICLE_POLLUTION"}
FILE_SIGNATURES = {
    "application/pdf": lambda data: data.startswith(b"%PDF-"),
    "image/jpeg": lambda data: data.startswith(b"\xff\xd8\xff"),
    "image/png": lambda data: data.startswith(b"\x89PNG\r\n\x1a\n"),
}


def _account_type(user: User) -> str:
    account_type = user.account_type or user.role
    if account_type == "BUSINESS":
        return "BUYER_BUSINESS"
    if account_type not in ACCOUNT_TYPES:
        raise HTTPException(status_code=409, detail="This account type cannot submit KYC")
    return account_type


def _latest_application(db: Session, user_id: str) -> KycApplication | None:
    return db.scalar(
        select(KycApplication)
        .where(KycApplication.user_id == user_id)
        .order_by(KycApplication.created_at.desc())
        .limit(1)
    )


def _audit(db: Session, application_id: str, actor_id: str, event_type: str, detail: str = "") -> None:
    db.add(KycAuditEvent(application_id=application_id, actor_id=actor_id, event_type=event_type, detail=detail[:2000]))


def _encrypt_profile(application: KycApplication, profile: dict[str, object]) -> bytes:
    raw = json.dumps(profile, ensure_ascii=True, separators=(",", ":")).encode("utf-8")
    return encrypt_private_data(raw, f"kyc-profile:{application.id}:{application.user_id}")


def seed_registration_profile(db: Session, user: User, profile: dict[str, str | None]) -> KycApplication:
    application = KycApplication(
        application_number=f"AGX-KYC-{secrets.token_hex(4).upper()}",
        user_id=user.id,
        account_type=user.account_type or user.role,
        status="DRAFT",
        encrypted_profile=b"",
        completion_percent=0,
    )
    db.add(application)
    db.flush()
    profile_data: dict[str, object] = {"fullName": user.full_name, "email": user.email}
    if user.mobile_number:
        profile_data["mobileNumber"] = user.mobile_number
    profile_data.update({key: value for key, value in profile.items() if value is not None})
    application.encrypted_profile = _encrypt_profile(application, profile_data)
    _audit(db, application.id, user.id, "REGISTRATION_PROFILE_SEEDED")
    return application


def _decrypt_profile(application: KycApplication) -> dict[str, object]:
    try:
        raw = decrypt_private_data(
            application.encrypted_profile,
            f"kyc-profile:{application.id}:{application.user_id}",
        )
        result = json.loads(raw)
    except (InvalidTag, ValueError, json.JSONDecodeError, RuntimeError) as exc:
        raise HTTPException(status_code=503, detail="KYC profile decryption is unavailable") from exc
    return result if isinstance(result, dict) else {}


def _document_read(document: KycDocument) -> KycDocumentRead:
    result = KycDocumentRead.model_validate(document)
    if document.expires_at:
        expiry = document.expires_at
        if expiry.tzinfo is None:
            expiry = expiry.replace(tzinfo=UTC)
        if expiry < datetime.now(UTC) and result.status != "REJECTED":
            result.status = "EXPIRED"
    return result


def _application_read(db: Session, application: KycApplication) -> KycApplicationRead:
    documents = list(
        db.scalars(
            select(KycDocument)
            .where(KycDocument.application_id == application.id)
            .order_by(KycDocument.uploaded_at.desc())
        ).all()
    )
    return KycApplicationRead(
        id=application.id,
        user_id=application.user_id,
        application_number=application.application_number,
        account_type=application.account_type,
        status=application.status,
        profile=_decrypt_profile(application),
        completion_percent=application.completion_percent,
        submitted_at=application.submitted_at,
        review_note=application.review_note,
        documents=[_document_read(document) for document in documents],
    )


def _present(value: object) -> bool:
    if isinstance(value, str):
        return bool(value.strip())
    if isinstance(value, (int, float)):
        return value >= 0
    if isinstance(value, list):
        return any(_present(item) for item in value)
    return value is not None


def _validate_profile(account_type: str, profile: dict[str, object]) -> None:
    missing = [field for field in REQUIRED_PROFILE_FIELDS[account_type] if not _present(profile.get(field))]
    if missing:
        raise HTTPException(status_code=422, detail=f"Complete required profile fields: {', '.join(missing)}")


def _latest_document_by_type(db: Session, application_id: str, document_type: str) -> KycDocument | None:
    return db.scalar(
        select(KycDocument)
        .where(KycDocument.application_id == application_id, KycDocument.document_type == document_type)
        .order_by(KycDocument.uploaded_at.desc())
        .limit(1)
    )


def _latest_vehicle_document(db: Session, vehicle_id: str, document_type: str) -> KycDocument | None:
    return db.scalar(
        select(KycDocument)
        .where(KycDocument.vehicle_id == vehicle_id, KycDocument.document_type == document_type)
        .order_by(KycDocument.uploaded_at.desc())
        .limit(1)
    )


def _set_business_verified(db: Session, user: User, application: KycApplication) -> None:
    if application.account_type not in BUSINESS_ACCOUNT_TYPES:
        return
    profile_data = _decrypt_profile(application)
    business_profile = db.scalar(select(BusinessProfile).where(BusinessProfile.user_id == user.id))
    if business_profile is None:
        business_profile = BusinessProfile(
            user_id=user.id,
            legal_name=str(profile_data.get("businessName") or user.full_name)[:180],
            business_type=BUSINESS_TYPES[application.account_type],
            gst_number=str(profile_data.get("gstNumber") or "")[:15] or None,
            address=str(profile_data.get("businessAddress") or profile_data.get("registeredAddress") or "KYC address on file")[:500],
            contact_phone=user.mobile_number,
        )
        db.add(business_profile)
    business_profile.is_verified = True


@router.get("/me", response_model=KycApplicationRead | None)
def read_my_kyc(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> KycApplicationRead | None:
    application = _latest_application(db, user.id)
    return _application_read(db, application) if application else None


@router.put("/profile", response_model=KycApplicationRead)
def save_kyc_profile(
    payload: KycProfileUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> KycApplicationRead:
    account_type = _account_type(user)
    if payload.account_type != account_type:
        raise HTTPException(status_code=403, detail="KYC account type cannot be changed after registration")
    if len(json.dumps(payload.profile, ensure_ascii=True)) > 65_536:
        raise HTTPException(status_code=413, detail="KYC profile is too large")
    application = _latest_application(db, user.id)
    if application is not None and application.status == "VERIFIED":
        raise HTTPException(status_code=409, detail="A verified profile cannot be edited")
    if application is None:
        application = KycApplication(
            application_number=f"AGX-KYC-{secrets.token_hex(4).upper()}",
            user_id=user.id,
            account_type=account_type,
            status="DRAFT",
            encrypted_profile=b"",
            completion_percent=0,
        )
        db.add(application)
        db.flush()
    profile = dict(payload.profile)
    profile["fullName"] = user.full_name
    profile["email"] = user.email
    if user.mobile_number:
        profile["mobileNumber"] = user.mobile_number
    application.encrypted_profile = _encrypt_profile(application, profile)
    fields = REQUIRED_PROFILE_FIELDS[account_type]
    completed_fields = sum(_present(profile.get(field)) for field in fields)
    application.completion_percent = round(completed_fields * 75 / len(fields))
    _audit(db, application.id, user.id, "PROFILE_SAVED")
    db.commit()
    db.refresh(application)
    return _application_read(db, application)


@router.post("/documents", response_model=KycDocumentRead, status_code=status.HTTP_201_CREATED)
async def upload_kyc_document(
    document_type: Annotated[str, Form()],
    file: Annotated[UploadFile, File()],
    expires_at: Annotated[str | None, Form()] = None,
    vehicle_id: Annotated[str | None, Form()] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> KycDocumentRead:
    document_type = document_type.strip().upper()
    if document_type not in DOCUMENT_TYPES:
        raise HTTPException(status_code=422, detail="Unsupported KYC document type")
    application = _latest_application(db, user.id)
    if application is None:
        raise HTTPException(status_code=409, detail="Save your KYC profile before uploading documents")
    if application.status in {"PENDING", "UNDER_REVIEW"}:
        raise HTTPException(status_code=409, detail="Documents cannot be changed while the application is under review")
    if application.status == "VERIFIED" and not (vehicle_id and document_type in VEHICLE_DOCUMENT_TYPES):
        raise HTTPException(status_code=409, detail="Only vehicle documents may be added to a verified transporter")
    previous = (
        _latest_vehicle_document(db, vehicle_id, document_type)
        if vehicle_id
        else _latest_document_by_type(db, application.id, document_type)
    )
    if previous and previous.status not in {"REJECTED", "EXPIRED"}:
        raise HTTPException(status_code=409, detail="A document of this type is already uploaded")
    if vehicle_id:
        vehicle = db.get(KycVehicle, vehicle_id)
        if vehicle is None or vehicle.owner_id != user.id:
            raise HTTPException(status_code=404, detail="Vehicle record not found")
        if document_type not in VEHICLE_DOCUMENT_TYPES:
            raise HTTPException(status_code=422, detail="Only vehicle-specific documents can be attached to a vehicle")

    max_bytes = get_settings().kyc_upload_max_bytes
    content = await file.read(max_bytes + 1)
    if len(content) > max_bytes:
        raise HTTPException(status_code=413, detail="Document exceeds the 10 MB upload limit")
    content_type = (file.content_type or "").lower()
    signature_check = FILE_SIGNATURES.get(content_type)
    if signature_check is None or not signature_check(content):
        raise HTTPException(status_code=415, detail="Upload a valid PDF, JPG, or PNG document")

    expiry: datetime | None = None
    if expires_at:
        try:
            expiry = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
            if expiry.tzinfo is None:
                expiry = datetime.combine(expiry.date(), time.min, UTC)
        except ValueError as exc:
            raise HTTPException(status_code=422, detail="Expiry date is invalid") from exc

    document_id = str(uuid4())
    storage_key = uuid4().hex
    safe_filename = re.sub(r"[^A-Za-z0-9._() -]", "_", Path(file.filename or "document").name)[:180] or "document"
    try:
        encrypted = encrypt_private_data(content, f"kyc-document:{document_id}:{user.id}")
        private_document_path(storage_key).write_bytes(encrypted)
    except (OSError, RuntimeError) as exc:
        raise HTTPException(status_code=503, detail="Secure document storage is not available") from exc

    document = KycDocument(
        id=document_id,
        application_id=application.id,
        vehicle_id=vehicle_id,
        document_type=document_type,
        original_filename=safe_filename,
        content_type=content_type,
        storage_key=storage_key,
        size_bytes=len(content),
        status="UPLOADED",
        expires_at=expiry,
    )
    db.add(document)
    if vehicle_id:
        vehicle = db.get(KycVehicle, vehicle_id)
        if vehicle:
            vehicle.status = "VERIFICATION_REQUIRED"
    _audit(db, application.id, user.id, "DOCUMENT_UPLOADED", document_type)
    try:
        db.commit()
    except Exception:
        db.rollback()
        private_document_path(storage_key).unlink(missing_ok=True)
        raise
    db.refresh(document)
    return _document_read(document)


@router.post("/submit", response_model=KycApplicationRead)
def submit_kyc_application(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> KycApplicationRead:
    application = _latest_application(db, user.id)
    if application is None:
        raise HTTPException(status_code=409, detail="Save your KYC profile before submitting")
    if application.status == "VERIFIED":
        raise HTTPException(status_code=409, detail="This profile is already verified")
    profile = _decrypt_profile(application)
    _validate_profile(application.account_type, profile)
    missing_documents = []
    for document_type in REQUIRED_DOCUMENTS[application.account_type]:
        document = _latest_document_by_type(db, application.id, document_type)
        if document is None or document.status not in {"UPLOADED", "UNDER_REVIEW", "VERIFIED"}:
            missing_documents.append(document_type)
    if missing_documents:
        raise HTTPException(status_code=422, detail=f"Upload required documents: {', '.join(sorted(missing_documents))}")

    application.status = "PENDING"
    application.review_note = None
    application.submitted_at = datetime.now(UTC)
    application.completion_percent = 100
    for document_type in REQUIRED_DOCUMENTS[application.account_type]:
        document = _latest_document_by_type(db, application.id, document_type)
        if document and document.status == "UPLOADED":
            document.status = "UNDER_REVIEW"
    user.kyc_status = "PENDING"
    _audit(db, application.id, user.id, "APPLICATION_SUBMITTED")
    db.commit()
    db.refresh(application)
    return _application_read(db, application)


@router.get("/documents/{document_id}/file")
def read_kyc_document(
    document_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Response:
    document = db.get(KycDocument, document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="KYC document not found")
    application = db.get(KycApplication, document.application_id)
    if application is None or (application.user_id != user.id and user.role != "ADMIN"):
        raise HTTPException(status_code=404, detail="KYC document not found")
    try:
        encrypted = private_document_path(document.storage_key).read_bytes()
        content = decrypt_private_data(encrypted, f"kyc-document:{document.id}:{application.user_id}")
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Stored document is unavailable") from exc
    except (InvalidTag, OSError, ValueError, RuntimeError) as exc:
        raise HTTPException(status_code=503, detail="Secure document storage is unavailable") from exc
    db.add(KycDocumentAccessLog(document_id=document.id, viewer_id=user.id, action="DOWNLOAD"))
    _audit(db, application.id, user.id, "DOCUMENT_ACCESSED", document.document_type)
    db.commit()
    filename = document.original_filename.replace('"', "")
    return Response(
        content=content,
        media_type=document.content_type,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-store, private",
            "X-Content-Type-Options": "nosniff",
        },
    )


@router.get("/admin/applications", response_model=list[KycApplicationSummaryRead])
def list_kyc_applications(
    application_status: str | None = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles("ADMIN")),
) -> list[KycApplicationSummaryRead]:
    del admin
    statement = select(KycApplication, User).join(User, User.id == KycApplication.user_id)
    if application_status:
        statement = statement.where(KycApplication.status == application_status.upper())
    statement = statement.order_by(KycApplication.submitted_at.asc().nulls_last(), KycApplication.created_at.asc())
    return [
        KycApplicationSummaryRead(
            id=application.id,
            user_id=applicant.id,
            application_number=application.application_number,
            account_type=application.account_type,
            status=application.status,
            submitted_at=application.submitted_at,
            applicant_name=applicant.full_name,
            applicant_email=applicant.email,
            applicant_mobile=applicant.mobile_number,
        )
        for application, applicant in db.execute(statement).all()
    ]


@router.get("/admin/applications/{application_id}", response_model=KycApplicationRead)
def read_kyc_application_for_review(
    application_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles("ADMIN")),
) -> KycApplicationRead:
    application = db.get(KycApplication, application_id)
    if application is None:
        raise HTTPException(status_code=404, detail="KYC application not found")
    _audit(db, application.id, admin.id, "APPLICATION_REVIEW_OPENED")
    db.commit()
    return _application_read(db, application)


@router.post("/admin/documents/{document_id}/review", response_model=KycDocumentRead)
def review_kyc_document(
    document_id: str,
    payload: KycDocumentReviewRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles("ADMIN")),
) -> KycDocumentRead:
    document = db.get(KycDocument, document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="KYC document not found")
    if payload.action in {"REJECTED", "REQUEST_REUPLOAD"} and not (payload.reason or "").strip():
        raise HTTPException(status_code=422, detail="A rejection or re-upload reason is required")
    expiry = document.expires_at
    if expiry and expiry.tzinfo is None:
        expiry = expiry.replace(tzinfo=UTC)
    if payload.action == "VERIFIED" and expiry and expiry < datetime.now(UTC):
        document.status = "EXPIRED"
        db.commit()
        raise HTTPException(status_code=409, detail="Expired documents cannot be verified")
    application = db.get(KycApplication, document.application_id)
    if application is None:
        raise HTTPException(status_code=404, detail="KYC application not found")
    if document.vehicle_id is None and application.status not in {"PENDING", "UNDER_REVIEW"}:
        raise HTTPException(status_code=409, detail="Only submitted applications can have documents reviewed")
    document.status = "REJECTED" if payload.action == "REQUEST_REUPLOAD" else payload.action
    document.review_reason = (payload.reason or "").strip() or None
    document.reviewed_by = admin.id
    if document.vehicle_id:
        vehicle = db.get(KycVehicle, document.vehicle_id)
        if vehicle:
            vehicle.status = "VERIFICATION_REQUIRED"
            if payload.action == "VERIFIED":
                required_documents_verified = all(
                    (latest := _latest_vehicle_document(db, vehicle.id, required_type)) is not None
                    and latest.status == "VERIFIED"
                    and not (latest.expires_at and latest.expires_at.replace(tzinfo=latest.expires_at.tzinfo or UTC) < datetime.now(UTC))
                    for required_type in REQUIRED_VEHICLE_DOCUMENTS
                )
                if required_documents_verified:
                    vehicle.status = "VERIFIED"
    elif payload.action in {"REJECTED", "REQUEST_REUPLOAD"}:
        application.status = "REJECTED"
        application.review_note = document.review_reason
        applicant = db.get(User, application.user_id)
        if applicant:
            applicant.kyc_status = "REJECTED"
    _audit(db, application.id, admin.id, f"DOCUMENT_{payload.action}", f"{document.document_type}: {document.review_reason or ''}")
    db.commit()
    db.refresh(document)
    return _document_read(document)


@router.post("/admin/applications/{application_id}/review", response_model=KycApplicationRead)
def review_kyc_application(
    application_id: str,
    payload: KycReviewRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles("ADMIN")),
) -> KycApplicationRead:
    application = db.get(KycApplication, application_id)
    if application is None:
        raise HTTPException(status_code=404, detail="KYC application not found")
    if application.status not in {"PENDING", "UNDER_REVIEW"}:
        raise HTTPException(status_code=409, detail="Only a submitted application can be approved or rejected")
    if payload.action == "REJECTED" and not (payload.reason or "").strip():
        raise HTTPException(status_code=422, detail="A rejection reason is required")
    applicant = db.get(User, application.user_id)
    if applicant is None:
        raise HTTPException(status_code=404, detail="Applicant not found")
    if payload.action == "APPROVED":
        for document_type in REQUIRED_DOCUMENTS[application.account_type]:
            document = _latest_document_by_type(db, application.id, document_type)
            if document is None or document.status != "VERIFIED":
                raise HTTPException(status_code=409, detail=f"Required document is not verified: {document_type}")
    application.status = "VERIFIED" if payload.action == "APPROVED" else payload.action
    application.reviewer_id = admin.id
    application.review_note = (payload.reason or "").strip() or None
    applicant.kyc_status = "VERIFIED" if payload.action == "APPROVED" else payload.action
    if payload.action == "APPROVED":
        _set_business_verified(db, applicant, application)
    _audit(db, application.id, admin.id, f"APPLICATION_{payload.action}", application.review_note or "")
    db.commit()
    db.refresh(application)
    return _application_read(db, application)


@router.get("/admin/expiring-documents", response_model=list[KycDocumentRead])
def list_expiring_kyc_documents(
    within_days: int = 30,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles("ADMIN")),
) -> list[KycDocumentRead]:
    del admin
    if not 1 <= within_days <= 180:
        raise HTTPException(status_code=422, detail="Expiry window must be between 1 and 180 days")
    cutoff = datetime.now(UTC) + timedelta(days=within_days)
    documents = db.scalars(
        select(KycDocument)
        .where(KycDocument.expires_at <= cutoff)
        .order_by(KycDocument.expires_at.asc())
    ).all()
    return [_document_read(document) for document in documents]


@router.post("/vehicles", response_model=KycVehicleRead, status_code=status.HTTP_201_CREATED)
def add_kyc_vehicle(
    payload: KycVehicleCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("BUSINESS")),
) -> KycVehicleRead:
    if _account_type(user) != "TRANSPORTER" or user.kyc_status != "VERIFIED":
        raise HTTPException(status_code=403, detail="Only verified transporters can add vehicles")
    required_fields = ("vehicleNumber", "vehicleType", "model", "manufacturingYear", "loadCapacity", "fuelType", "refrigerated", "availability")
    if any(not _present(payload.details.get(field)) for field in required_fields):
        raise HTTPException(status_code=422, detail="Complete all required vehicle details")
    vehicle = KycVehicle(owner_id=user.id, encrypted_details=b"", status="VERIFICATION_REQUIRED")
    db.add(vehicle)
    db.flush()
    vehicle.encrypted_details = encrypt_private_data(
        json.dumps(payload.details, ensure_ascii=True, separators=(",", ":")).encode("utf-8"),
        f"kyc-vehicle:{vehicle.id}:{user.id}",
    )
    db.commit()
    db.refresh(vehicle)
    return KycVehicleRead(id=vehicle.id, details=payload.details, status=vehicle.status, created_at=vehicle.created_at)


@router.get("/vehicles", response_model=list[KycVehicleRead])
def list_kyc_vehicles(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("BUSINESS")),
) -> list[KycVehicleRead]:
    vehicles = db.scalars(
        select(KycVehicle).where(KycVehicle.owner_id == user.id).order_by(KycVehicle.created_at.desc())
    ).all()
    results = []
    for vehicle in vehicles:
        try:
            details = json.loads(decrypt_private_data(vehicle.encrypted_details, f"kyc-vehicle:{vehicle.id}:{user.id}"))
        except (InvalidTag, ValueError, json.JSONDecodeError, RuntimeError) as exc:
            raise HTTPException(status_code=503, detail="Vehicle record decryption is unavailable") from exc
        results.append(KycVehicleRead(id=vehicle.id, details=details, status=vehicle.status, created_at=vehicle.created_at))
    return results


@router.get("/admin/vehicles", response_model=list[KycVehicleAdminRead])
def list_admin_kyc_vehicles(
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles("ADMIN")),
) -> list[KycVehicleAdminRead]:
    del admin
    rows = db.execute(
        select(KycVehicle, User)
        .join(User, User.id == KycVehicle.owner_id)
        .order_by(KycVehicle.created_at.desc())
    ).all()
    results = []
    for vehicle, owner in rows:
        try:
            details = json.loads(
                decrypt_private_data(vehicle.encrypted_details, f"kyc-vehicle:{vehicle.id}:{owner.id}")
            )
        except (InvalidTag, ValueError, json.JSONDecodeError, RuntimeError) as exc:
            raise HTTPException(status_code=503, detail="Vehicle record decryption is unavailable") from exc
        results.append(KycVehicleAdminRead(
            id=vehicle.id,
            owner_id=owner.id,
            owner_name=owner.full_name,
            owner_email=owner.email,
            details=details,
            status=vehicle.status,
            created_at=vehicle.created_at,
        ))
    return results


@router.get("/admin/transporters", response_model=list[VerifiedTransporterRead])
def list_verified_transporters(
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles("ADMIN")),
) -> list[VerifiedTransporterRead]:
    del admin
    transporters = db.scalars(
        select(User).where(
            User.role == "BUSINESS",
            User.account_type == "TRANSPORTER",
            User.kyc_status == "VERIFIED",
            User.is_active.is_(True),
        ).order_by(User.full_name)
    ).all()
    return [
        VerifiedTransporterRead(
            id=transporter.id,
            company_name=(db.scalar(select(BusinessProfile.legal_name).where(BusinessProfile.user_id == transporter.id)) or transporter.full_name),
        )
        for transporter in transporters
    ]


@router.post("/admin/users/{driver_user_id}/transporter")
def assign_driver_to_transporter(
    driver_user_id: str,
    payload: DriverTransporterAssignment,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles("ADMIN")),
) -> dict[str, str]:
    driver = db.get(User, driver_user_id)
    transporter = db.get(User, payload.transporter_id)
    if driver is None or driver.role != "DRIVER":
        raise HTTPException(status_code=404, detail="Driver account not found")
    if transporter is None or transporter.role != "BUSINESS" or transporter.account_type != "TRANSPORTER" or transporter.kyc_status != "VERIFIED" or not transporter.is_active:
        raise HTTPException(status_code=409, detail="Choose an active, verified transporter")
    driver.transporter_id = transporter.id
    application = _latest_application(db, driver.id)
    if application:
        _audit(db, application.id, admin.id, "TRANSPORTER_ASSIGNED", transporter.id)
    db.commit()
    return {"driverId": driver.id, "transporterId": transporter.id}


@router.get("/admin/audit/{application_id}")
def read_kyc_audit_events(
    application_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles("ADMIN")),
) -> list[dict[str, object]]:
    del admin
    events = db.scalars(
        select(KycAuditEvent)
        .where(KycAuditEvent.application_id == application_id)
        .order_by(KycAuditEvent.created_at.desc())
    ).all()
    return [
        {"eventType": event.event_type, "detail": event.detail, "actorId": event.actor_id, "createdAt": event.created_at}
        for event in events
    ]


@router.post("/admin/users/{user_id}/suspend", status_code=status.HTTP_204_NO_CONTENT)
def suspend_kyc_user(
    user_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles("ADMIN")),
) -> None:
    user = db.get(User, user_id)
    if user is None or user.role == "ADMIN":
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    application = _latest_application(db, user.id)
    if application:
        _audit(db, application.id, admin.id, "ACCOUNT_SUSPENDED")
    db.commit()


@router.post("/admin/users/{user_id}/reactivate", status_code=status.HTTP_204_NO_CONTENT)
def reactivate_kyc_user(
    user_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles("ADMIN")),
) -> None:
    user = db.get(User, user_id)
    if user is None or user.role == "ADMIN":
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = True
    application = _latest_application(db, user.id)
    if application:
        _audit(db, application.id, admin.id, "ACCOUNT_REACTIVATED")
    db.commit()
