"""persist farmer vehicle selection and cargo volume"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "38e7d15cb920"
down_revision: Union[str, None] = "9a81c42e7d11"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("shipments", sa.Column("vehicle_type", sa.String(length=48), nullable=True))
    op.add_column("shipments", sa.Column("cargo_volume_m3", sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column("shipments", "cargo_volume_m3")
    op.drop_column("shipments", "vehicle_type")