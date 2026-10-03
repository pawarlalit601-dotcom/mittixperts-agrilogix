from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.security import decode_access_token


bearer_scheme = HTTPBearer(auto_error=False)


def get_optional_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User | None:
    token = credentials.credentials if credentials else request.cookies.get("access_token")
    user_id = decode_access_token(token) if token else None
    user = db.get(User, user_id) if user_id else None
    return user if user is not None and user.is_active else None


def get_current_user(user: User | None = Depends(get_optional_current_user)) -> User:
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    return user


def require_roles(*roles: str):
    def dependency(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return user

    return dependency


def ensure_verified_kyc(user: User) -> None:
    if user.role != "ADMIN" and user.kyc_status != "VERIFIED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Complete KYC verification before using this feature",
        )