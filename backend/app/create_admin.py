from getpass import getpass

from sqlalchemy import select

from app.database import SessionLocal
from app.models import User
from app.security import hash_password


def main() -> None:
    email = input("Administrator email: ").strip().lower()
    full_name = input("Administrator name: ").strip()
    password = getpass("Administrator password (16+ characters): ")
    confirmation = getpass("Confirm password: ")
    if len(password) < 16:
        raise SystemExit("Password must contain at least 16 characters.")
    if password != confirmation:
        raise SystemExit("Passwords do not match.")

    with SessionLocal() as db:
        existing = db.scalar(select(User).where(User.email == email))
        if existing:
            raise SystemExit("An account with this email already exists.")
        db.add(User(email=email, full_name=full_name, password_hash=hash_password(password), role="ADMIN"))
        db.commit()
    print("Administrator account created.")


if __name__ == "__main__":
    main()