"""add location-filtered vehicle availability and alerts"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "78b4a0e6d112"
down_revision: Union[str, None] = "63ad91fc4b20"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("service_area", sa.String(length=120), nullable=True))
    op.add_column("users", sa.Column("preferred_pickup_area", sa.String(length=120), nullable=True))
    op.create_index("ix_users_service_area", "users", ["service_area"])
    op.create_index("ix_users_preferred_pickup_area", "users", ["preferred_pickup_area"])

    op.create_table(
        "vehicle_availability",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("owner_id", sa.String(length=36), nullable=False),
        sa.Column("driver_id", sa.String(length=36), nullable=True),
        sa.Column("vehicle_number", sa.String(length=32), nullable=False),
        sa.Column("vehicle_type", sa.String(length=48), nullable=False),
        sa.Column("current_location", sa.String(length=240), nullable=False),
        sa.Column("pickup_area", sa.String(length=120), nullable=False),
        sa.Column("destination", sa.String(length=120), nullable=False),
        sa.Column("route", sa.String(length=500), nullable=False),
        sa.Column("available_capacity", sa.Float(), nullable=False),
        sa.Column("total_capacity", sa.Float(), nullable=False),
        sa.Column("rate_inr", sa.Float(), nullable=False),
        sa.Column("refrigerated", sa.Boolean(), nullable=False),
        sa.Column("departure_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("estimated_arrival_time", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", sa.String(length=24), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["driver_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("vehicle_number"),
    )
    for column in ("owner_id", "driver_id", "vehicle_number", "vehicle_type", "pickup_area", "destination", "refrigerated", "departure_time", "status"):
        op.create_index(f"ix_vehicle_availability_{column}", "vehicle_availability", [column])
    op.create_index("ix_vehicle_availability_area_status_departure", "vehicle_availability", ["pickup_area", "status", "departure_time"])

    op.create_table(
        "vehicle_bookings",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("vehicle_id", sa.String(length=36), nullable=False),
        sa.Column("requester_id", sa.String(length=36), nullable=False),
        sa.Column("shipment_id", sa.String(length=36), nullable=True),
        sa.Column("requested_capacity_kg", sa.Float(), nullable=False),
        sa.Column("status", sa.String(length=24), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["vehicle_id"], ["vehicle_availability.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["requester_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["shipment_id"], ["shipments.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    for column in ("vehicle_id", "requester_id", "shipment_id", "status"):
        op.create_index(f"ix_vehicle_bookings_{column}", "vehicle_bookings", [column])

    op.create_table(
        "vehicle_notifications",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("vehicle_id", sa.String(length=36), nullable=False),
        sa.Column("event_type", sa.String(length=32), nullable=False),
        sa.Column("title", sa.String(length=120), nullable=False),
        sa.Column("message", sa.String(length=500), nullable=False),
        sa.Column("is_read", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["vehicle_id"], ["vehicle_availability.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    for column in ("user_id", "vehicle_id", "event_type", "is_read", "created_at"):
        op.create_index(f"ix_vehicle_notifications_{column}", "vehicle_notifications", [column])
    op.create_index("ix_vehicle_notifications_user_created", "vehicle_notifications", ["user_id", "created_at"])


def downgrade() -> None:
    op.drop_index("ix_vehicle_notifications_user_created", table_name="vehicle_notifications")
    for column in ("created_at", "is_read", "event_type", "vehicle_id", "user_id"):
        op.drop_index(f"ix_vehicle_notifications_{column}", table_name="vehicle_notifications")
    op.drop_table("vehicle_notifications")
    for column in ("status", "shipment_id", "requester_id", "vehicle_id"):
        op.drop_index(f"ix_vehicle_bookings_{column}", table_name="vehicle_bookings")
    op.drop_table("vehicle_bookings")
    op.drop_index("ix_vehicle_availability_area_status_departure", table_name="vehicle_availability")
    for column in ("status", "departure_time", "refrigerated", "destination", "pickup_area", "vehicle_type", "vehicle_number", "driver_id", "owner_id"):
        op.drop_index(f"ix_vehicle_availability_{column}", table_name="vehicle_availability")
    op.drop_table("vehicle_availability")
    op.drop_index("ix_users_preferred_pickup_area", table_name="users")
    op.drop_index("ix_users_service_area", table_name="users")
    op.drop_column("users", "preferred_pickup_area")
    op.drop_column("users", "service_area")
