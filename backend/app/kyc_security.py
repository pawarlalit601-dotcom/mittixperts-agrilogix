import base64
import os
import re
import secrets
from pathlib import Path

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from app.config import get_settings


_STORAGE_KEY_PATTERN = re.compile(r"^[0-9a-f]{32}$")


def storage_root() -> Path:
    configured_path = Path(get_settings().kyc_storage_dir)
    backend_root = Path(__file__).resolve().parents[1]
    root = configured_path if configured_path.is_absolute() else backend_root / configured_path
    root.mkdir(parents=True, exist_ok=True)
    return root.resolve()


def _load_encryption_key() -> bytes:
    settings = get_settings()
    configured_key = settings.kyc_encryption_key.get_secret_value().strip()
    if configured_key:
        try:
            key = base64.urlsafe_b64decode(configured_key + "=" * (-len(configured_key) % 4))
        except (ValueError, base64.binascii.Error) as exc:
            raise RuntimeError("KYC_ENCRYPTION_KEY must be a base64-encoded 32-byte key") from exc
    elif settings.app_env.lower() == "development":
        key_path = storage_root().parent / "kyc-dev.key"
        key_path.parent.mkdir(parents=True, exist_ok=True)
        try:
            with key_path.open("xb") as key_file:
                key_file.write(base64.urlsafe_b64encode(secrets.token_bytes(32)))
            try:
                os.chmod(key_path, 0o600)
            except OSError:
                pass
        except FileExistsError:
            pass
        try:
            key = base64.urlsafe_b64decode(key_path.read_bytes())
        except (OSError, ValueError, base64.binascii.Error) as exc:
            raise RuntimeError("The local KYC encryption key could not be read") from exc
    else:
        raise RuntimeError("KYC_ENCRYPTION_KEY must be configured before accepting KYC documents")

    if len(key) != 32:
        raise RuntimeError("KYC_ENCRYPTION_KEY must decode to exactly 32 bytes")
    return key


def encrypt_private_data(plaintext: bytes, associated_data: str) -> bytes:
    nonce = secrets.token_bytes(12)
    ciphertext = AESGCM(_load_encryption_key()).encrypt(nonce, plaintext, associated_data.encode("utf-8"))
    return nonce + ciphertext


def decrypt_private_data(ciphertext: bytes, associated_data: str) -> bytes:
    if len(ciphertext) < 29:
        raise ValueError("Encrypted KYC data is incomplete")
    nonce, encrypted_content = ciphertext[:12], ciphertext[12:]
    return AESGCM(_load_encryption_key()).decrypt(nonce, encrypted_content, associated_data.encode("utf-8"))


def private_document_path(storage_key: str) -> Path:
    if not _STORAGE_KEY_PATTERN.fullmatch(storage_key):
        raise ValueError("Invalid private document key")
    return storage_root() / f"{storage_key}.enc"
