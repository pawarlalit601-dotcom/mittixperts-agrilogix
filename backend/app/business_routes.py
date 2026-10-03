from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, aliased

from app.database import get_db
from app.deps import ensure_verified_kyc, get_current_user, require_roles
from app.models import (
    BusinessLocation,
    CropMarketCategory,
    BusinessNegotiationEvent,
    BusinessOrder,
    BusinessProfile,
    BusinessListing,
    Shipment,
    TransportQuote,
    TransportRequest,
    User,
)
from app.schemas import (
    BusinessListingCreate,
    BusinessListingRead,
    BusinessLocationCreate,
    BusinessLocationRead,
    BusinessNegotiationRead,
    BusinessOrderCreate,
    BusinessOrderOffer,
    BusinessOrderRead,
    BusinessProfileCreate,
    BusinessProfileRead,
    BusinessTransactionRead,
    TransportQuoteCreate,
    TransportQuoteRead,
    TransportRequestCreate,
    TransportRequestRead,
)


router = APIRouter(prefix="/api/v1/business", tags=["business-to-business"])


def get_business_profile(db: Session, user_id: str) -> BusinessProfile:
    profile = db.scalar(select(BusinessProfile).where(BusinessProfile.user_id == user_id))
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business profile not found")
    return profile


def require_verified_business(db: Session, user: User, business_type: str | None = None) -> BusinessProfile:
    profile = get_business_profile(db, user.id)
    if user.kyc_status != "VERIFIED":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Approved KYC verification is required")
    if not profile.is_verified:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Business verification is required")
    if business_type and profile.business_type != business_type:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Verified transport-company status is required")
    return profile


@router.get("/profile", response_model=BusinessProfileRead)
def read_business_profile(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("BUSINESS")),
) -> BusinessProfile:
    return get_business_profile(db, user.id)


@router.put("/profile", response_model=BusinessProfileRead)
def update_business_profile(
    payload: BusinessProfileCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("BUSINESS")),
) -> BusinessProfile:
    profile = get_business_profile(db, user.id)
    for field, value in payload.model_dump().items():
        setattr(profile, field, value)
    profile.is_verified = False
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="GSTIN is already registered") from exc
    db.refresh(profile)
    return profile


@router.post("/locations", response_model=BusinessLocationRead, status_code=status.HTTP_201_CREATED)
def add_business_location(
    payload: BusinessLocationCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("BUSINESS")),
) -> BusinessLocation:
    profile = get_business_profile(db, user.id)
    location = BusinessLocation(business_id=profile.id, label=payload.label, address=payload.address)
    db.add(location)
    db.commit()
    db.refresh(location)
    return location


@router.get("/locations", response_model=list[BusinessLocationRead])
def list_business_locations(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("BUSINESS")),
) -> list[BusinessLocation]:
    profile = get_business_profile(db, user.id)
    return list(db.scalars(select(BusinessLocation).where(BusinessLocation.business_id == profile.id)).all())


@router.get("/profiles/pending", response_model=list[BusinessProfileRead])
def list_pending_business_profiles(
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles("ADMIN")),
) -> list[BusinessProfile]:
    del admin
    statement = select(BusinessProfile).where(BusinessProfile.is_verified.is_(False)).order_by(BusinessProfile.created_at)
    return list(db.scalars(statement).all())


@router.post("/listings", response_model=BusinessListingRead, status_code=status.HTTP_201_CREATED)
def create_listing(
    payload: BusinessListingCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("BUSINESS")),
) -> BusinessListing:
    require_verified_business(db, user)
    category = db.get(CropMarketCategory, payload.market_category_id)
    if category is None or category.eligibility_rule != "ALLOW":
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Choose an eligible market category for this crop")
    if category.crop.strip().casefold() != payload.crop.strip().casefold():
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="The selected market category does not match the crop")
    if payload.minimum_order_kg > payload.quantity_kg:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Minimum order exceeds listed quantity")
    listing = BusinessListing(
        seller_id=user.id,
        crop=payload.crop,
        market_category_id=category.category_id,
        variety=payload.variety,
        grade=payload.grade,
        quantity_kg=payload.quantity_kg,
        available_quantity_kg=payload.quantity_kg,
        minimum_order_kg=payload.minimum_order_kg,
        price_per_kg=payload.price_per_kg,
        pickup_location=payload.pickup_location,
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing


@router.get("/listings", response_model=list[BusinessListingRead])
def list_marketplace_listings(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[BusinessListing]:
    if user.role not in {"BUSINESS", "FARMER", "BUYER", "ADMIN"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Marketplace access denied")
    statement = select(BusinessListing).where(BusinessListing.status == "OPEN").order_by(BusinessListing.created_at.desc())
    return list(db.scalars(statement).all())


@router.post("/orders", response_model=BusinessOrderRead, status_code=status.HTTP_201_CREATED)
def create_business_order(
    payload: BusinessOrderCreate,
    db: Session = Depends(get_db),
    buyer: User = Depends(require_roles("BUSINESS")),
) -> BusinessOrder:
    require_verified_business(db, buyer)
    listing = db.scalar(
        select(BusinessListing).where(BusinessListing.id == payload.listing_id, BusinessListing.status == "OPEN").with_for_update()
    )
    if listing is None or listing.seller_id == buyer.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Available listing not found")
    if payload.quantity_kg < listing.minimum_order_kg or payload.quantity_kg > listing.available_quantity_kg:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Requested quantity is outside listing limits")
    order = BusinessOrder(
        listing_id=listing.id,
        buyer_id=buyer.id,
        seller_id=listing.seller_id,
        quantity_kg=payload.quantity_kg,
        current_offer_per_kg=listing.price_per_kg,
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.get("/orders", response_model=list[BusinessOrderRead])
def list_business_orders(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("BUSINESS")),
) -> list[BusinessOrder]:
    statement = select(BusinessOrder).where(or_(BusinessOrder.buyer_id == user.id, BusinessOrder.seller_id == user.id))
    return list(db.scalars(statement.order_by(BusinessOrder.created_at.desc())).all())


@router.get("/transactions", response_model=list[BusinessTransactionRead])
def list_business_transactions(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("BUSINESS")),
) -> list[BusinessTransactionRead]:
    buyer = aliased(User)
    seller = aliased(User)
    statement = (
        select(BusinessOrder, BusinessListing, buyer, seller)
        .join(BusinessListing, BusinessListing.id == BusinessOrder.listing_id)
        .join(buyer, buyer.id == BusinessOrder.buyer_id)
        .join(seller, seller.id == BusinessOrder.seller_id)
        .where(or_(BusinessOrder.buyer_id == user.id, BusinessOrder.seller_id == user.id))
        .order_by(BusinessOrder.created_at.desc())
    )
    return [
        BusinessTransactionRead(
            id=order.id,
            listing_id=listing.id,
            buyer_name=buyer_user.full_name,
            seller_name=seller_user.full_name,
            crop=listing.crop,
            grade=listing.grade,
            pickup_location=listing.pickup_location,
            quantity_kg=order.quantity_kg,
            price_per_kg=order.current_offer_per_kg,
            total_value_inr=round(order.quantity_kg * order.current_offer_per_kg, 2),
            status=order.status,
            payment_status="NOT_RECORDED",
            created_at=order.created_at,
            updated_at=order.updated_at,
        )
        for order, listing, buyer_user, seller_user in db.execute(statement).all()
    ]


@router.post("/orders/{order_id}/offers", response_model=BusinessNegotiationRead, status_code=status.HTTP_201_CREATED)
def submit_order_offer(
    order_id: str,
    payload: BusinessOrderOffer,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("BUSINESS")),
) -> BusinessNegotiationEvent:
    order = db.get(BusinessOrder, order_id)
    if order is None or user.id not in {order.buyer_id, order.seller_id}:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.status not in {"NEGOTIATING", "OFFER_PENDING"}:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Order is no longer negotiable")
    order.current_offer_per_kg = payload.price_per_kg
    order.status = "NEGOTIATING"
    event = BusinessNegotiationEvent(order_id=order.id, actor_id=user.id, price_per_kg=payload.price_per_kg)
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.post("/orders/{order_id}/accept", response_model=BusinessOrderRead)
def accept_business_order(
    order_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("BUSINESS")),
) -> BusinessOrder:
    order = db.get(BusinessOrder, order_id)
    if order is None or user.id not in {order.buyer_id, order.seller_id}:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.status != "NEGOTIATING":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Only a negotiated order can be accepted")
    listing = db.scalar(select(BusinessListing).where(BusinessListing.id == order.listing_id).with_for_update())
    if listing is None or listing.available_quantity_kg < order.quantity_kg:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Listing quantity is no longer available")
    listing.available_quantity_kg -= order.quantity_kg
    if listing.available_quantity_kg == 0:
        listing.status = "CLOSED"
    order.status = "ACCEPTED"
    db.commit()
    db.refresh(order)
    return order


@router.post("/transport-requests", response_model=TransportRequestRead, status_code=status.HTTP_201_CREATED)
def create_transport_request(
    payload: TransportRequestCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> TransportRequest:
    if user.role == "FARMER":
        ensure_verified_kyc(user)
    elif user.role == "BUSINESS":
        require_verified_business(db, user)
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Transport requests are available to farmers and verified businesses")
    if payload.shipment_id:
        shipment = db.get(Shipment, payload.shipment_id)
        if shipment is None or (user.role == "FARMER" and shipment.farmer_id != user.id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shipment not found")
    request = TransportRequest(requester_id=user.id, **payload.model_dump())
    db.add(request)
    db.commit()
    db.refresh(request)
    return request


@router.get("/transport-requests", response_model=list[TransportRequestRead])
def list_transport_requests(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[TransportRequest]:
    statement = select(TransportRequest)
    if user.role == "FARMER":
        ensure_verified_kyc(user)
        statement = statement.where(TransportRequest.requester_id == user.id)
    elif user.role == "BUSINESS":
        profile = require_verified_business(db, user)
        if profile.business_type != "Transport Company":
            statement = statement.where(TransportRequest.requester_id == user.id)
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Transport request access denied")
    return list(db.scalars(statement.order_by(TransportRequest.created_at.desc())).all())


def _transport_quote_read(db: Session, quote: TransportQuote) -> TransportQuoteRead:
    carrier = db.get(User, quote.carrier_id)
    profile = db.scalar(select(BusinessProfile).where(BusinessProfile.user_id == quote.carrier_id))
    return TransportQuoteRead(
        id=quote.id,
        request_id=quote.request_id,
        carrier_id=quote.carrier_id,
        carrier_name=carrier.full_name if carrier else "Verified transporter",
        carrier_company=profile.legal_name if profile else "Verified transport company",
        vehicle_type=quote.vehicle_type,
        refrigerated=quote.refrigerated,
        price_inr=quote.price_inr,
        vehicle_count=quote.vehicle_count,
        estimated_hours=quote.estimated_hours,
        status=quote.status,
        created_at=quote.created_at,
    )


def _require_transport_request_owner(db: Session, user: User, request_id: str) -> TransportRequest:
    transport_request = db.get(TransportRequest, request_id)
    if transport_request is None or transport_request.requester_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transport request not found")
    if user.role == "FARMER":
        ensure_verified_kyc(user)
    elif user.role == "BUSINESS":
        require_verified_business(db, user)
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Transport request access denied")
    return transport_request


@router.get("/transport-requests/{request_id}/quotes", response_model=list[TransportQuoteRead])
def list_transport_quotes(
    request_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[TransportQuoteRead]:
    _require_transport_request_owner(db, user, request_id)
    quotes = db.scalars(
        select(TransportQuote)
        .where(TransportQuote.request_id == request_id)
        .order_by(TransportQuote.price_inr.asc(), TransportQuote.created_at.asc())
    ).all()
    return [_transport_quote_read(db, quote) for quote in quotes]


@router.post("/transport-requests/{request_id}/quotes/{quote_id}/accept", response_model=TransportQuoteRead)
def accept_transport_quote(
    request_id: str,
    quote_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> TransportQuoteRead:
    transport_request = _require_transport_request_owner(db, user, request_id)
    quote = db.get(TransportQuote, quote_id)
    if quote is None or quote.request_id != transport_request.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Carrier quote not found")
    if transport_request.status == "AWARDED":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A carrier quote has already been accepted")
    quote.status = "ACCEPTED"
    for other_quote in db.scalars(
        select(TransportQuote).where(
            TransportQuote.request_id == transport_request.id,
            TransportQuote.id != quote.id,
        )
    ).all():
        other_quote.status = "NOT_SELECTED"
    transport_request.status = "AWARDED"
    if transport_request.shipment_id:
        shipment = db.get(Shipment, transport_request.shipment_id)
        if shipment:
            shipment.vehicle_type = quote.vehicle_type
            shipment.storage_condition = "Refrigerated carrier quote accepted" if quote.refrigerated else "Standard carrier quote accepted"
    db.commit()
    db.refresh(quote)
    return _transport_quote_read(db, quote)


@router.post("/transport-requests/{request_id}/quotes", response_model=TransportQuoteRead, status_code=status.HTTP_201_CREATED)
def quote_transport_request(
    request_id: str,
    payload: TransportQuoteCreate,
    db: Session = Depends(get_db),
    carrier: User = Depends(require_roles("BUSINESS")),
) -> TransportQuoteRead:
    require_verified_business(db, carrier, "Transport Company")
    transport_request = db.get(TransportRequest, request_id)
    if transport_request is None or transport_request.requester_id == carrier.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Open transport request not found")
    if transport_request.status != "OPEN":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This transport request is no longer open")
    if transport_request.preferred_vehicle_type and payload.vehicle_type != transport_request.preferred_vehicle_type:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Quote must match the requested vehicle size")
    if transport_request.refrigerated and not payload.refrigerated:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="This load requires a refrigerated vehicle")
    quote = TransportQuote(request_id=request_id, carrier_id=carrier.id, **payload.model_dump())
    db.add(quote)
    db.commit()
    db.refresh(quote)
    return _transport_quote_read(db, quote)


@router.post("/profiles/{profile_id}/verify", response_model=BusinessProfileRead)
def verify_business(
    profile_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles("ADMIN")),
) -> BusinessProfile:
    profile = db.get(BusinessProfile, profile_id)
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business profile not found")
    applicant = db.get(User, profile.user_id)
    if applicant is None or applicant.kyc_status != "VERIFIED":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Approve the applicant's KYC request before verifying the business")
    del admin
    profile.is_verified = True
    db.commit()
    db.refresh(profile)
    return profile