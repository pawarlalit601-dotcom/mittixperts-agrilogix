"""secure KYC onboarding and document review"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "7c12b004d6aa"
down_revision: Union[str, None] = "5399309cf596"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("account_type", sa.String(length=24), nullable=True))
    op.add_column("users", sa.Column("preferred_language", sa.String(length=5), nullable=False, server_default="en"))
    op.add_column("users", sa.Column("mobile_number", sa.String(length=20), nullable=True))
    op.add_column("users", sa.Column("mobile_verified", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column("users", sa.Column("kyc_status", sa.String(length=24), nullable=False, server_default="NOT_STARTED"))
    op.add_column("users", sa.Column("transporter_id", sa.String(length=36), nullable=True))
    op.execute("UPDATE users SET account_type = role WHERE role IN ('FARMER', 'DRIVER')")
    op.execute("UPDATE users SET account_type = 'BUYER_BUSINESS' WHERE role IN ('BUYER', 'BUSINESS')")
    op.execute("UPDATE users SET account_type = 'TRANSPORTER' WHERE id IN (SELECT user_id FROM business_profiles WHERE business_type = 'Transport Company')")
    op.execute("UPDATE users SET account_type = 'WHOLESALER' WHERE id IN (SELECT user_id FROM business_profiles WHERE business_type = 'Wholesaler')")
    op.execute("UPDATE users SET account_type = 'RETAILER' WHERE id IN (SELECT user_id FROM business_profiles WHERE business_type = 'Retailer')")
    op.execute("UPDATE users SET account_type = 'FPO' WHERE id IN (SELECT user_id FROM business_profiles WHERE business_type = 'Farmer Group / FPO')")
    op.create_index("ix_users_account_type", "users", ["account_type"])
    op.create_index("ix_users_mobile_number", "users", ["mobile_number"])
    op.create_index("ix_users_kyc_status", "users", ["kyc_status"])
    op.create_index("ix_users_transporter_id", "users", ["transporter_id"])

    op.create_table(
        "kyc_applications",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("application_number", sa.String(length=32), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("account_type", sa.String(length=24), nullable=False),
        sa.Column("status", sa.String(length=24), nullable=False),
        sa.Column("encrypted_profile", sa.LargeBinary(), nullable=False),
        sa.Column("completion_percent", sa.Integer(), nullable=False),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("reviewer_id", sa.String(length=36), nullable=True),
        sa.Column("review_note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["reviewer_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("application_number"),
    )
    op.create_index("ix_kyc_applications_application_number", "kyc_applications", ["application_number"], unique=True)
    op.create_index("ix_kyc_applications_user_id", "kyc_applications", ["user_id"])
    op.create_index("ix_kyc_applications_account_type", "kyc_applications", ["account_type"])
    op.create_index("ix_kyc_applications_status", "kyc_applications", ["status"])
    op.create_index("ix_kyc_applications_status_created", "kyc_applications", ["status", "created_at"])

    op.create_table(
        "kyc_vehicles",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("owner_id", sa.String(length=36), nullable=False),
        sa.Column("encrypted_details", sa.LargeBinary(), nullable=False),
        sa.Column("status", sa.String(length=24), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_kyc_vehicles_owner_id", "kyc_vehicles", ["owner_id"])
    op.create_index("ix_kyc_vehicles_status", "kyc_vehicles", ["status"])

    op.create_table(
        "kyc_documents",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("application_id", sa.String(length=36), nullable=False),
        sa.Column("vehicle_id", sa.String(length=36), nullable=True),
        sa.Column("document_type", sa.String(length=48), nullable=False),
        sa.Column("original_filename", sa.String(length=180), nullable=False),
        sa.Column("content_type", sa.String(length=80), nullable=False),
        sa.Column("storage_key", sa.String(length=64), nullable=False),
        sa.Column("size_bytes", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=24), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("review_reason", sa.Text(), nullable=True),
        sa.Column("reviewed_by", sa.String(length=36), nullable=True),
        sa.Column("uploaded_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["application_id"], ["kyc_applications.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["vehicle_id"], ["kyc_vehicles.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["reviewed_by"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("storage_key"),
    )
    for column in ("application_id", "vehicle_id", "document_type", "status", "expires_at"):
        op.create_index(f"ix_kyc_documents_{column}", "kyc_documents", [column])
    op.create_index("ix_kyc_documents_application_type", "kyc_documents", ["application_id", "document_type"])

    op.create_table(
        "kyc_audit_events",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("application_id", sa.String(length=36), nullable=False),
        sa.Column("actor_id", sa.String(length=36), nullable=False),
        sa.Column("event_type", sa.String(length=40), nullable=False),
        sa.Column("detail", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["application_id"], ["kyc_applications.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["actor_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    for column in ("application_id", "actor_id", "event_type", "created_at"):
        op.create_index(f"ix_kyc_audit_events_{column}", "kyc_audit_events", [column])

    op.create_table(
        "kyc_document_access_logs",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("document_id", sa.String(length=36), nullable=False),
        sa.Column("viewer_id", sa.String(length=36), nullable=False),
        sa.Column("action", sa.String(length=24), nullable=False),
        sa.Column("accessed_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["document_id"], ["kyc_documents.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["viewer_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    for column in ("document_id", "viewer_id", "accessed_at"):
        op.create_index(f"ix_kyc_document_access_logs_{column}", "kyc_document_access_logs", [column])


def downgrade() -> None:
    for table, columns in (
        ("kyc_document_access_logs", ("accessed_at", "viewer_id", "document_id")),
        ("kyc_audit_events", ("created_at", "event_type", "actor_id", "application_id")),
        ("kyc_documents", ("application_type",)),
    ):
        for column in columns:
            index = f"ix_{table}_{column}"
            if table == "kyc_documents" and column == "application_type":
                index = "ix_kyc_documents_application_type"
            op.drop_index(index, table_name=table)
    for column in ("expires_at", "status", "document_type", "vehicle_id", "application_id"):
        op.drop_index(f"ix_kyc_documents_{column}", table_name="kyc_documents")
    for column in ("status", "owner_id"):
        op.drop_index(f"ix_kyc_vehicles_{column}", table_name="kyc_vehicles")
    for column in ("status_created", "status", "account_type", "user_id", "application_number"):
        name = "ix_kyc_applications_status_created" if column == "status_created" else f"ix_kyc_applications_{column}"
        op.drop_index(name, table_name="kyc_applications")
    op.drop_table("kyc_document_access_logs")
    op.drop_table("kyc_audit_events")
    op.drop_table("kyc_documents")
    op.drop_table("kyc_vehicles")
    op.drop_table("kyc_applications")
    for column in ("transporter_id", "kyc_status", "mobile_number", "account_type"):
        op.drop_index(f"ix_users_{column}", table_name="users")
    op.drop_column("users", "transporter_id")
    op.drop_column("users", "kyc_status")
    op.drop_column("users", "mobile_verified")
    op.drop_column("users", "mobile_number")
    op.drop_column("users", "preferred_language")
    op.drop_column("users", "account_type")