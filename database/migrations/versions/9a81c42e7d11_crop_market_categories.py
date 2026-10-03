"""crop market category master

Revision ID: 9a81c42e7d11
Revises: 7c12b004d6aa
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "9a81c42e7d11"
down_revision: Union[str, None] = "7c12b004d6aa"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "crop_market_categories",
        sa.Column("category_id", sa.String(length=32), nullable=False),
        sa.Column("source_category_id", sa.String(length=32), nullable=False),
        sa.Column("crop", sa.String(length=80), nullable=False),
        sa.Column("valid_market_category", sa.String(length=160), nullable=False),
        sa.Column("eligibility_rule", sa.String(length=16), nullable=False),
        sa.Column("recommendation_use", sa.Text(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("category_id"),
        sa.UniqueConstraint("crop", "source_category_id", name="uq_crop_market_category_source"),
    )
    op.create_index("ix_crop_market_categories_crop", "crop_market_categories", ["crop"])
    op.create_index("ix_crop_market_categories_eligibility_rule", "crop_market_categories", ["eligibility_rule"])
    op.add_column("business_listings", sa.Column("market_category_id", sa.String(length=32), nullable=True))
    op.create_index("ix_business_listings_market_category_id", "business_listings", ["market_category_id"])


def downgrade() -> None:
    op.drop_index("ix_business_listings_market_category_id", table_name="business_listings")
    op.drop_column("business_listings", "market_category_id")
    op.drop_index("ix_crop_market_categories_eligibility_rule", table_name="crop_market_categories")
    op.drop_index("ix_crop_market_categories_crop", table_name="crop_market_categories")
    op.drop_table("crop_market_categories")