"""link farmer shipment requests to transporter vehicle quotes"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "63ad91fc4b20"
down_revision: Union[str, None] = "38e7d15cb920"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("business_transport_requests") as batch_op:
        batch_op.add_column(sa.Column("shipment_id", sa.String(length=36), nullable=True))
        batch_op.add_column(sa.Column("preferred_vehicle_type", sa.String(length=48), nullable=True))
        batch_op.add_column(sa.Column("cargo_volume_m3", sa.Float(), nullable=True))
        batch_op.add_column(sa.Column("refrigerated", sa.Boolean(), nullable=False, server_default=sa.false()))
        batch_op.create_foreign_key(
            "fk_business_transport_requests_shipment_id_shipments",
            "shipments",
            ["shipment_id"],
            ["id"],
            ondelete="SET NULL",
        )
        batch_op.create_index("ix_business_transport_requests_shipment_id", ["shipment_id"])
    with op.batch_alter_table("business_transport_quotes") as batch_op:
        batch_op.add_column(sa.Column("vehicle_type", sa.String(length=48), nullable=False, server_default="unspecified"))
        batch_op.add_column(sa.Column("refrigerated", sa.Boolean(), nullable=False, server_default=sa.false()))


def downgrade() -> None:
    with op.batch_alter_table("business_transport_quotes") as batch_op:
        batch_op.drop_column("refrigerated")
        batch_op.drop_column("vehicle_type")
    with op.batch_alter_table("business_transport_requests") as batch_op:
        batch_op.drop_index("ix_business_transport_requests_shipment_id")
        batch_op.drop_constraint("fk_business_transport_requests_shipment_id_shipments", type_="foreignkey")
        batch_op.drop_column("refrigerated")
        batch_op.drop_column("cargo_volume_m3")
        batch_op.drop_column("preferred_vehicle_type")
        batch_op.drop_column("shipment_id")