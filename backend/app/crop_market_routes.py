from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import BusinessListing, BusinessProfile, CropMarketCategory, User
from app.schemas import CropMarketCategoryRateRead


router = APIRouter(prefix="/api/v1/market-categories", tags=["crop market categories"])


@router.get("/crops", response_model=list[str])
def list_crops(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[str]:
    if user.role not in {"FARMER", "DRIVER", "BUYER", "BUSINESS", "ADMIN"}:
        raise HTTPException(status_code=403, detail="Crop category access denied")
    return list(db.scalars(
        select(CropMarketCategory.crop)
        .where(CropMarketCategory.eligibility_rule == "ALLOW")
        .distinct()
        .order_by(CropMarketCategory.crop)
    ).all())


@router.get("/{crop}/categories", response_model=list[CropMarketCategoryRateRead])
def list_crop_market_categories(
    crop: str,
    quantity_kg: float | None = Query(default=None, gt=0, le=1_000_000),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[CropMarketCategoryRateRead]:
    if user.role not in {"FARMER", "DRIVER", "BUYER", "BUSINESS", "ADMIN"}:
        raise HTTPException(status_code=403, detail="Crop category access denied")
    normalized_crop = crop.strip().casefold()
    if not normalized_crop:
        raise HTTPException(status_code=422, detail="Crop name is required")
    categories = list(db.scalars(
        select(CropMarketCategory)
        .where(
            func.lower(CropMarketCategory.crop) == normalized_crop,
            CropMarketCategory.eligibility_rule == "ALLOW",
        )
        .order_by(CropMarketCategory.valid_market_category)
    ).all())
    if not categories:
        raise HTTPException(status_code=404, detail="No eligible market categories are configured for this crop")

    listing_query = (
        select(
            BusinessListing.market_category_id,
            func.count(BusinessListing.id),
            func.coalesce(func.sum(BusinessListing.available_quantity_kg), 0),
            func.min(BusinessListing.price_per_kg),
            func.avg(BusinessListing.price_per_kg),
            func.max(BusinessListing.price_per_kg),
        )
        .join(User, User.id == BusinessListing.seller_id)
        .join(BusinessProfile, BusinessProfile.user_id == BusinessListing.seller_id)
        .where(
            func.lower(BusinessListing.crop) == normalized_crop,
            BusinessListing.status == "OPEN",
            BusinessListing.available_quantity_kg > 0,
            User.is_active.is_(True),
            User.kyc_status == "VERIFIED",
            BusinessProfile.is_verified.is_(True),
        )
        .group_by(BusinessListing.market_category_id)
    )
    if quantity_kg is not None:
        listing_query = listing_query.having(func.sum(BusinessListing.available_quantity_kg) >= quantity_kg)
    observed = {row[0]: row[1:] for row in db.execute(listing_query).all() if row[0]}

    result = []
    for category in categories:
        offer = observed.get(category.category_id)
        if offer:
            offer_count, available_quantity, low, average, high = offer
            low_price = round(float(low), 2) if low is not None else None
            average_price = round(float(average), 2) if average is not None else None
            high_price = round(float(high), 2) if high is not None else None
            offer_count = int(offer_count)
            available_quantity = round(float(available_quantity), 2)
        else:
            offer_count, available_quantity = 0, 0.0
            low_price = average_price = high_price = None
        result.append(CropMarketCategoryRateRead(
            category_id=category.category_id,
            source_category_id=category.source_category_id,
            crop=category.crop,
            category=category.valid_market_category,
            recommendation_use=category.recommendation_use,
            active_offer_count=offer_count,
            available_quantity_kg=available_quantity,
            low_price_per_kg=low_price,
            average_price_per_kg=average_price,
            high_price_per_kg=high_price,
            rank_score=None,
        ))
    return sorted(
        result,
        key=lambda item: (
            item.average_price_per_kg is not None,
            item.average_price_per_kg or 0,
            item.available_quantity_kg,
        ),
        reverse=True,
    )
