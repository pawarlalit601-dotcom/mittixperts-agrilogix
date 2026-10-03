"""Initial users, shipments, location, and reroute-audit schema."""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("full_name", sa.String(length=120), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=16), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_role", "users", ["role"], unique=False)
    op.create_table(
        "shipments",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("tracking_number", sa.String(length=48), nullable=False),
        sa.Column("farmer_id", sa.String(length=36), nullable=False),
        sa.Column("driver_id", sa.String(length=36), nullable=True),
        sa.Column("buyer_id", sa.String(length=36), nullable=True),
        sa.Column("crop", sa.String(length=80), nullable=False),
        sa.Column("variety", sa.String(length=120), nullable=False),
        sa.Column("quantity_kg", sa.Float(), nullable=False),
        sa.Column("harvest_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("expected_shelf_life_hours", sa.Float(), nullable=False),
        sa.Column("quality_grade", sa.String(length=80), nullable=False),
        sa.Column("storage_condition", sa.String(length=120), nullable=False),
        sa.Column("origin", sa.String(length=240), nullable=False),
        sa.Column("destination", sa.String(length=240), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["buyer_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["driver_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["farmer_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("tracking_number"),
    )
    op.create_index("ix_shipments_buyer_id", "shipments", ["buyer_id"], unique=False)
    op.create_index("ix_shipments_crop", "shipments", ["crop"], unique=False)
    op.create_index("ix_shipments_driver_id", "shipments", ["driver_id"], unique=False)
    op.create_index("ix_shipments_farmer_id", "shipments", ["farmer_id"], unique=False)
    op.create_index("ix_shipments_status", "shipments", ["status"], unique=False)
    op.create_index("ix_shipments_tracking_number", "shipments", ["tracking_number"], unique=True)
    op.create_table(
        "reroute_audits",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("shipment_id", sa.String(length=36), nullable=False),
        sa.Column("actor_id", sa.String(length=36), nullable=False),
        sa.Column("original_destination", sa.String(length=240), nullable=False),
        sa.Column("recommended_destination", sa.String(length=240), nullable=False),
        sa.Column("reason", sa.Text(), nullable=False),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["actor_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["shipment_id"], ["shipments.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_reroute_audits_actor_id", "reroute_audits", ["actor_id"], unique=False)
    op.create_index("ix_reroute_audits_shipment_id", "reroute_audits", ["shipment_id"], unique=False)
    op.create_table(
        "shipment_locations",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("shipment_id", sa.String(length=36), nullable=False),
        sa.Column("driver_id", sa.String(length=36), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("accuracy_meters", sa.Float(), nullable=True),
        sa.Column("speed_kmh", sa.Float(), nullable=True),
        sa.Column("recorded_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["driver_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["shipment_id"], ["shipments.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_shipment_locations_driver_id", "shipment_locations", ["driver_id"], unique=False)
    op.create_index("ix_shipment_locations_recorded_at", "shipment_locations", ["recorded_at"], unique=False)
    op.create_index("ix_shipment_locations_shipment_id", "shipment_locations", ["shipment_id"], unique=False)
    op.create_index("ix_shipment_locations_shipment_recorded", "shipment_locations", ["shipment_id", "recorded_at"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_shipment_locations_shipment_recorded", table_name="shipment_locations")
    op.drop_index("ix_shipment_locations_shipment_id", table_name="shipment_locations")
    op.drop_index("ix_shipment_locations_recorded_at", table_name="shipment_locations")
    op.drop_index("ix_shipment_locations_driver_id", table_name="shipment_locations")
    op.drop_table("shipment_locations")
    op.drop_index("ix_reroute_audits_shipment_id", table_name="reroute_audits")
    op.drop_index("ix_reroute_audits_actor_id", table_name="reroute_audits")
    op.drop_table("reroute_audits")
    op.drop_index("ix_shipments_tracking_number", table_name="shipments")
    op.drop_index("ix_shipments_status", table_name="shipments")
    op.drop_index("ix_shipments_farmer_id", table_name="shipments")
    op.drop_index("ix_shipments_driver_id", table_name="shipments")
    op.drop_index("ix_shipments_crop", table_name="shipments")
    op.drop_index("ix_shipments_buyer_id", table_name="shipments")
    op.drop_table("shipments")
    op.drop_index("ix_users_role", table_name="users")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")