from datetime import UTC, datetime, timedelta

from sqlalchemy import select

from app.database import SessionLocal
from app.models import BusinessProfile, BusinessListing, CropMarketCategory, KycApplication, KycDocument, Shipment, User, UserActivity
from app.security import hash_password


def sign_in(client, email: str):
    return client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "correct horse battery staple"},
    )


def register(client, email: str, role: str, *, authenticate: bool = True):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "fullName": email.split("@")[0],
            "password": "correct horse battery staple",
            "role": role,
        },
    )
    if response.status_code == 201 and authenticate:
        assert sign_in(client, email).status_code == 200
        with SessionLocal() as db:
            user = db.scalar(select(User).where(User.email == email))
            assert user is not None
            user.kyc_status = "VERIFIED"
            db.commit()
    return response


def create_shipment(client):
    return client.post(
        "/api/v1/shipments",
        json={
            "crop": "Tomato",
            "variety": "Roma",
            "quantityKg": 850,
            "harvestAt": datetime.now(UTC).isoformat(),
            "expectedShelfLifeHours": 48,
            "qualityGrade": "Grade A",
            "storageCondition": "Refrigerated",
            "origin": "Nashik Farm",
            "destination": "Pune Market",
        },
    )


def add_test_crop_category():
    with SessionLocal() as db:
        db.add(CropMarketCategory(
            category_id="tomato::TOM-01",
            source_category_id="TOM-01",
            crop="Tomato",
            valid_market_category="Fresh Vegetable Wholesale",
            eligibility_rule="ALLOW",
            recommendation_use="Test-only eligible listing category",
        ))
        db.commit()


def test_registration_creates_account_without_signing_in(client):
    response = register(client, "farmer@example.com", "FARMER", authenticate=False)

    assert response.status_code == 201
    assert response.json()["role"] == "FARMER"
    assert "password" not in response.json()
    assert "set-cookie" not in response.headers
    assert client.get("/api/v1/auth/me").json() is None

    with SessionLocal() as db:
        user = db.scalar(select(User).where(User.email == "farmer@example.com"))
        assert user is not None
        assert user.password_hash != "correct horse battery staple"

    login_response = sign_in(client, "farmer@example.com")
    assert login_response.status_code == 200
    assert "httponly" in login_response.headers["set-cookie"].lower()
    assert "max-age=2592000" in login_response.headers["set-cookie"].lower()
    assert client.get("/api/v1/auth/me").json()["email"] == "farmer@example.com"

    duplicate = register(client, "farmer@example.com", "FARMER", authenticate=False)
    assert duplicate.status_code == 409


def test_registration_saves_location_in_encrypted_kyc_draft(client):
    registration = client.post(
        "/api/v1/auth/register",
        json={
            "email": "location-user@example.com",
            "fullName": "Location User",
            "password": "correct horse battery staple",
            "role": "FARMER",
            "accountType": "FARMER",
            "mobileNumber": "+919876543212",
            "village": "Pimpalgaon",
            "district": "Nashik",
            "state": "Maharashtra",
        },
    )

    assert registration.status_code == 201
    assert sign_in(client, "location-user@example.com").status_code == 200
    application = client.get("/api/v1/kyc/me")

    assert application.status_code == 200
    assert application.json()["profile"]["village"] == "Pimpalgaon"
    assert application.json()["profile"]["district"] == "Nashik"
    assert application.json()["profile"]["state"] == "Maharashtra"

    with SessionLocal() as db:
        saved_application = db.scalar(select(KycApplication).where(KycApplication.user_id == registration.json()["id"]))
        assert saved_application is not None
        assert b"Pimpalgaon" not in saved_application.encrypted_profile


def test_current_user_returns_empty_for_anonymous_session(client):
    response = client.get("/api/v1/auth/me")

    assert response.status_code == 200
    assert response.json() is None


def test_user_language_preference_is_persisted(client):
    registration = client.post(
        "/api/v1/auth/register",
        json={
            "email": "language-user@example.com",
            "fullName": "Language User",
            "password": "correct horse battery staple",
            "role": "FARMER",
            "accountType": "FARMER",
            "mobileNumber": "+919876543210",
            "preferredLanguage": "hi",
        },
    )
    assert registration.status_code == 201
    assert registration.json()["preferredLanguage"] == "hi"
    assert client.patch("/api/v1/auth/preferences", json={"preferredLanguage": "mr"}).status_code == 401
    assert sign_in(client, "language-user@example.com").status_code == 200

    changed = client.patch("/api/v1/auth/preferences", json={"preferredLanguage": "mr"})

    assert changed.status_code == 200
    assert changed.json()["preferredLanguage"] == "mr"
    assert client.get("/api/v1/auth/me").json()["preferredLanguage"] == "mr"
    unsupported = client.patch("/api/v1/auth/preferences", json={"preferredLanguage": "xx"})
    assert unsupported.status_code == 422


def test_user_activity_is_recorded_for_auth_events(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "activity-user@example.com",
            "fullName": "Activity User",
            "password": "correct horse battery staple",
            "role": "FARMER",
            "accountType": "FARMER",
            "mobileNumber": "+919876543211",
            "preferredLanguage": "en",
        },
    )
    assert response.status_code == 201

    login_response = sign_in(client, "activity-user@example.com")
    assert login_response.status_code == 200

    with SessionLocal() as db:
        events = db.scalars(
            select(UserActivity)
            .where(UserActivity.user_id == response.json()["id"])
            .order_by(UserActivity.created_at.desc())
        ).all()
        assert any(event.action == "REGISTER" for event in events)
        assert any(event.action == "LOGIN" for event in events)


def test_crop_categories_are_crop_specific_and_prices_need_verified_offers(client):
    add_test_crop_category()
    assert register(client, "crop-farmer@example.com", "FARMER").status_code == 201

    categories = client.get("/api/v1/market-categories/Tomato/categories")
    assert categories.status_code == 200
    assert len(categories.json()) == 1
    assert categories.json()[0]["sourceCategoryId"] == "TOM-01"
    assert categories.json()[0]["averagePricePerKg"] is None
    assert client.get("/api/v1/market-categories/Potato/categories").status_code == 404

    with SessionLocal() as db:
        seller = User(
            email="verified-seller@example.com",
            full_name="Verified Seller",
            password_hash=hash_password("correct horse battery staple"),
            role="BUSINESS",
            account_type="WHOLESALER",
            kyc_status="VERIFIED",
        )
        db.add(seller)
        db.flush()
        db.add(BusinessProfile(
            user_id=seller.id,
            legal_name="Verified Seller Ltd",
            business_type="Wholesaler",
            address="Nashik",
            is_verified=True,
        ))
        db.commit()
    seller_client = type(client)(client.app)
    assert sign_in(seller_client, "verified-seller@example.com").status_code == 200
    listing = seller_client.post(
        "/api/v1/business/listings",
        json={
            "crop": "Tomato",
            "marketCategoryId": "tomato::TOM-01",
            "grade": "Grade A",
            "quantityKg": 500,
            "minimumOrderKg": 100,
            "pricePerKg": 32.5,
            "pickupLocation": "Nashik Market",
        },
    )
    assert listing.status_code == 201

    rate_category = client.get("/api/v1/market-categories/Tomato/categories").json()[0]
    assert rate_category["activeOfferCount"] == 1
    assert rate_category["averagePricePerKg"] == 32.5
    assert rate_category["availableQuantityKg"] == 500


def test_unverified_farmer_cannot_create_official_shipment(client):
    assert register(client, "pending-farmer@example.com", "FARMER", authenticate=False).status_code == 201
    assert sign_in(client, "pending-farmer@example.com").status_code == 200

    response = create_shipment(client)

    assert response.status_code == 403
    assert response.json()["detail"] == "Complete KYC verification before using this feature"


def test_verified_shipment_persists_farmer_vehicle_choice(client):
    assert register(client, "vehicle-choice@example.com", "FARMER").status_code == 201
    response = client.post(
        "/api/v1/shipments",
        json={
            "crop": "Grapes",
            "variety": "Thompson Seedless",
            "quantityKg": 1800,
            "vehicleType": "light-truck",
            "cargoVolumeM3": 12.5,
            "harvestAt": datetime.now(UTC).isoformat(),
            "expectedShelfLifeHours": 48,
            "qualityGrade": "Grade A",
            "storageCondition": "Refrigerated transport requested",
            "origin": "Nashik Farm",
            "destination": "Pune Market",
        },
    )

    assert response.status_code == 201
    assert response.json()["vehicleType"] == "light-truck"
    assert response.json()["cargoVolumeM3"] == 12.5


def test_farmer_can_compare_and_accept_verified_carrier_vehicle_rates(client):
    assert register(client, "quote-farmer@example.com", "FARMER").status_code == 201
    shipment = create_shipment(client)
    assert shipment.status_code == 201
    transport_request = client.post(
        "/api/v1/business/transport-requests",
        json={
            "shipmentId": shipment.json()["id"],
            "pickup": "Nashik Farm",
            "destination": "Pune Market",
            "quantityKg": 1800,
            "preferredVehicleType": "light-truck",
            "cargoVolumeM3": 12.5,
            "refrigerated": False,
            "truckCount": 1,
            "deliveryAt": datetime.now(UTC).isoformat(),
        },
    )
    assert transport_request.status_code == 201

    with SessionLocal() as db:
        carrier = User(
            email="verified-carrier@example.com",
            full_name="Verified Carrier",
            password_hash=hash_password("correct horse battery staple"),
            role="BUSINESS",
            account_type="TRANSPORTER",
            kyc_status="VERIFIED",
        )
        db.add(carrier)
        db.flush()
        db.add(BusinessProfile(
            user_id=carrier.id,
            legal_name="Nashik Fresh Transport",
            business_type="Transport Company",
            address="Nashik, Maharashtra",
            is_verified=True,
        ))
        db.commit()

    carrier_client = type(client)(client.app)
    assert sign_in(carrier_client, "verified-carrier@example.com").status_code == 200
    request_id = transport_request.json()["id"]
    standard_quote = carrier_client.post(
        f"/api/v1/business/transport-requests/{request_id}/quotes",
        json={
            "priceInr": 18000,
            "vehicleCount": 1,
            "estimatedHours": 5,
            "vehicleType": "light-truck",
            "refrigerated": False,
        },
    )
    refrigerated_quote = carrier_client.post(
        f"/api/v1/business/transport-requests/{request_id}/quotes",
        json={
            "priceInr": 24000,
            "vehicleCount": 1,
            "estimatedHours": 5,
            "vehicleType": "light-truck",
            "refrigerated": True,
        },
    )

    assert standard_quote.status_code == 201
    assert refrigerated_quote.status_code == 201
    quote_list = client.get(f"/api/v1/business/transport-requests/{request_id}/quotes")
    assert quote_list.status_code == 200
    assert [quote["priceInr"] for quote in quote_list.json()] == [18000, 24000]
    assert [quote["refrigerated"] for quote in quote_list.json()] == [False, True]
    assert quote_list.json()[0]["carrierCompany"] == "Nashik Fresh Transport"

    accepted = client.post(
        f"/api/v1/business/transport-requests/{request_id}/quotes/{refrigerated_quote.json()['id']}/accept"
    )
    assert accepted.status_code == 200
    assert accepted.json()["status"] == "ACCEPTED"
    assert client.get("/api/v1/business/transport-requests").json()[0]["status"] == "AWARDED"


def test_vehicle_board_filters_location_and_route_and_notifies_matching_service_area(client):
    assert register(client, "bangalore-farmer@example.com", "FARMER").status_code == 201
    with SessionLocal() as db:
        farmer = db.scalar(select(User).where(User.email == "bangalore-farmer@example.com"))
        assert farmer is not None
        farmer.service_area = "Bengaluru Urban"
        farmer.preferred_pickup_area = "Bangalore"
        carrier = User(
            email="vehicle-carrier@example.com",
            full_name="Vehicle Carrier",
            password_hash=hash_password("correct horse battery staple"),
            role="BUSINESS",
            account_type="TRANSPORTER",
            kyc_status="VERIFIED",
        )
        remote_farmer = User(
            email="ahmedabad-farmer@example.com",
            full_name="Ahmedabad Farmer",
            password_hash=hash_password("correct horse battery staple"),
            role="FARMER",
            account_type="FARMER",
            kyc_status="VERIFIED",
            service_area="Ahmedabad",
            preferred_pickup_area="Ahmedabad",
        )
        db.add_all([carrier, remote_farmer])
        db.flush()
        db.add(BusinessProfile(
            user_id=carrier.id,
            legal_name="Verified Bengaluru Transport",
            business_type="Transport Company",
            address="Bengaluru, Karnataka",
            is_verified=True,
        ))
        db.commit()

    carrier_client = type(client)(client.app)
    assert sign_in(carrier_client, "vehicle-carrier@example.com").status_code == 200
    departure = (datetime.now(UTC) + timedelta(hours=4)).isoformat()
    arrival = (datetime.now(UTC) + timedelta(hours=12)).isoformat()

    def publish_vehicle(number, pickup, destination, route, capacity, rate, refrigerated=False):
        return carrier_client.post("/api/v1/vehicle-availability", json={
            "vehicleNumber": number,
            "vehicleType": "Eicher / light truck",
            "currentLocation": f"{pickup} yard",
            "pickupArea": pickup,
            "destination": destination,
            "route": route,
            "availableCapacity": capacity,
            "totalCapacity": capacity,
            "rateInr": rate,
            "refrigerated": refrigerated,
            "departureTime": departure,
            "estimatedArrivalTime": arrival,
        })

    local_standard = publish_vehicle("KA-01-AB-2456", "Bangalore", "Pune", "Bangalore to Pune via Tumakuru", 8, 18000)
    local_reefer = publish_vehicle("KA-05-XY-7821", "Bangalore", "Pune", "Bangalore to Pune via Tumakuru", 5, 26000, True)
    unrelated = publish_vehicle("GJ-01-CD-1234", "Ahmedabad", "Surat", "Ahmedabad to Surat", 12, 21000)
    assert local_standard.status_code == local_reefer.status_code == unrelated.status_code == 201

    matching = client.get("/api/v1/vehicle-availability", params={
        "pickup_area": "Bangalore",
        "destination": "Pune",
        "required_capacity_kg": 4000,
    })
    assert matching.status_code == 200
    assert {vehicle["vehicleNumber"] for vehicle in matching.json()} == {"KA-01-AB-2456", "KA-05-XY-7821"}
    assert {vehicle["refrigerated"] for vehicle in matching.json()} == {False, True}
    assert len(client.get("/api/v1/vehicle-availability/notifications").json()) == 2

    booking = client.post(
        f"/api/v1/vehicle-availability/{local_standard.json()['id']}/book",
        json={"requestedCapacityKg": 6000},
    )
    assert booking.status_code == 201
    carrier_vehicles = carrier_client.get("/api/v1/vehicle-availability/mine").json()
    booked_vehicle = next(vehicle for vehicle in carrier_vehicles if vehicle["id"] == local_standard.json()["id"])
    assert booked_vehicle["availableCapacity"] == 2
    assert booked_vehicle["status"] == "FILLING_FAST"

    remote_client = type(client)(client.app)
    assert sign_in(remote_client, "ahmedabad-farmer@example.com").status_code == 200
    remote_vehicles = remote_client.get("/api/v1/vehicle-availability", params={"pickup_area": "Ahmedabad"})
    assert remote_vehicles.status_code == 200
    assert [vehicle["vehicleNumber"] for vehicle in remote_vehicles.json()] == ["GJ-01-CD-1234"]
    assert len(remote_client.get("/api/v1/vehicle-availability/notifications").json()) == 1


def test_kyc_documents_are_private_encrypted_and_require_admin_approval(client, monkeypatch, tmp_path):
    from app import kyc_security

    monkeypatch.setattr(kyc_security, "storage_root", lambda: tmp_path)
    assert register(client, "kyc-farmer@example.com", "FARMER", authenticate=False).status_code == 201
    assert sign_in(client, "kyc-farmer@example.com").status_code == 200
    profile = {
        "fullName": "KYC Farmer",
        "mobileNumber": "9876543210",
        "dateOfBirth": "1990-04-12",
        "address": "Farm Road, Nashik",
        "village": "Pimpalgaon",
        "taluka": "Niphad",
        "district": "Nashik",
        "state": "Maharashtra",
        "pinCode": "422209",
        "farmLocation": "Survey 19, Pimpalgaon",
        "landArea": "4.5",
        "landTenure": "Owned",
        "majorCrops": "Grapes, onion",
        "expectedProduction": "12000 kg",
        "availableHarvestPeriod": "October to December",
        "preferredMarkets": "Nashik, Pune",
        "aadhaarLastFour": "1234",
        "panNumber": "ABCDE1234F",
        "bankAccountHolder": "KYC Farmer",
        "bankAccountNumber": "123456789012",
        "ifscCode": "ABCD0123456",
    }
    saved = client.put("/api/v1/kyc/profile", json={"accountType": "FARMER", "profile": profile})
    assert saved.status_code == 200
    application_id = saved.json()["id"]

    with SessionLocal() as db:
        from app.models import KycApplication

        application = db.get(KycApplication, application_id)
        assert application is not None
        assert b"ABCDE1234F" not in application.encrypted_profile
        assert b"123456789012" not in application.encrypted_profile

    pdf = b"%PDF-1.7\nprivate kyc fixture\n%%EOF"
    uploaded_documents = []
    for document_type in ("IDENTITY", "BANK_PROOF"):
        upload = client.post(
            "/api/v1/kyc/documents",
            data={"document_type": document_type},
            files={"file": (f"{document_type.lower()}.pdf", pdf, "application/pdf")},
        )
        assert upload.status_code == 201
        uploaded_documents.append(upload.json())
        with SessionLocal() as db:
            stored_document = db.get(KycDocument, upload.json()["id"])
            assert stored_document is not None
            storage_key = stored_document.storage_key
        encrypted_file = (tmp_path / f"{storage_key}.enc").read_bytes()
        assert not encrypted_file.startswith(b"%PDF-")

    submitted = client.post("/api/v1/kyc/submit")
    assert submitted.status_code == 200
    assert submitted.json()["status"] == "PENDING"
    assert create_shipment(client).status_code == 403

    outsider = type(client)(client.app)
    assert register(outsider, "kyc-outsider@example.com", "BUYER", authenticate=False).status_code == 201
    assert sign_in(outsider, "kyc-outsider@example.com").status_code == 200
    private_document_id = uploaded_documents[0]["id"]
    assert outsider.get(f"/api/v1/kyc/documents/{private_document_id}/file").status_code == 404
    assert client.get(f"/api/v1/kyc/documents/{private_document_id}/file").content == pdf

    with SessionLocal() as db:
        admin = User(
            email="kyc-admin@example.com",
            full_name="KYC Admin",
            password_hash=hash_password("correct horse battery staple"),
            role="ADMIN",
        )
        db.add(admin)
        db.commit()
    admin_client = type(client)(client.app)
    assert admin_client.post(
        "/api/v1/auth/login",
        json={"email": "kyc-admin@example.com", "password": "correct horse battery staple"},
    ).status_code == 200
    queue = admin_client.get("/api/v1/kyc/admin/applications")
    assert queue.status_code == 200
    assert queue.json()[0]["applicationNumber"] == submitted.json()["applicationNumber"]
    admin_detail = admin_client.get(f"/api/v1/kyc/admin/applications/{application_id}")
    assert admin_detail.status_code == 200
    assert admin_detail.json()["profile"]["panNumber"] == "ABCDE1234F"

    for document in uploaded_documents:
        review = admin_client.post(
            f"/api/v1/kyc/admin/documents/{document['id']}/review",
            json={"action": "VERIFIED"},
        )
        assert review.status_code == 200
    approved = admin_client.post(
        f"/api/v1/kyc/admin/applications/{application_id}/review",
        json={"action": "APPROVED"},
    )
    assert approved.status_code == 200
    assert approved.json()["status"] == "VERIFIED"
    assert client.get("/api/v1/auth/me").json()["kycStatus"] == "VERIFIED"
    assert create_shipment(client).status_code == 201


def test_google_login_verifies_identity_and_issues_session(client, monkeypatch):
    from app import routes

    monkeypatch.setattr(routes.settings, "google_client_id", "test-google-client-id")

    def verify_google_credential(credential, request, audience):
        assert credential == "mock-google-identity-token"
        assert audience == "test-google-client-id"
        return {
            "sub": "google-user-123",
            "email": "google-farmer@example.com",
            "email_verified": True,
            "name": "Google Farmer",
        }

    monkeypatch.setattr(routes.google_id_token, "verify_oauth2_token", verify_google_credential)
    response = client.post(
        "/api/v1/auth/google",
        json={"credential": "mock-google-identity-token"},
    )

    assert response.status_code == 200
    assert response.json()["user"]["email"] == "google-farmer@example.com"
    assert response.json()["user"]["role"] == "FARMER"
    assert "httponly" in response.headers["set-cookie"].lower()
    assert client.get("/api/v1/auth/me").json()["id"] == response.json()["user"]["id"]


def test_google_login_rejects_unverified_email(client, monkeypatch):
    from app import routes

    monkeypatch.setattr(routes.settings, "google_client_id", "test-google-client-id")
    monkeypatch.setattr(
        routes.google_id_token,
        "verify_oauth2_token",
        lambda credential, request, audience: {
            "sub": "google-user-unverified",
            "email": "unverified@example.com",
            "email_verified": False,
        },
    )

    response = client.post(
        "/api/v1/auth/google",
        json={"credential": "mock-google-identity-token"},
    )

    assert response.status_code == 401
    with SessionLocal() as db:
        assert db.scalar(select(User).where(User.email == "unverified@example.com")) is None


def test_only_assigned_driver_can_publish_precise_location(client):
    assert register(client, "farmer@example.com", "FARMER").status_code == 201
    shipment_response = create_shipment(client)
    assert shipment_response.status_code == 201
    shipment_id = shipment_response.json()["id"]

    driver_client = type(client)(client.app)
    assert register(driver_client, "driver@example.com", "DRIVER").status_code == 201
    with SessionLocal() as db:
        driver = db.scalar(select(User).where(User.email == "driver@example.com"))
        shipment = db.get(Shipment, shipment_id)
        assert driver is not None and shipment is not None
        shipment.driver_id = driver.id
        db.commit()

    location = driver_client.post(
        f"/api/v1/shipments/{shipment_id}/locations",
        json={"latitude": 19.9975, "longitude": 73.7898, "accuracyMeters": 8, "speedKmh": 32},
    )
    assert location.status_code == 201

    farmer_location = client.get(f"/api/v1/shipments/{shipment_id}/locations/latest")
    assert farmer_location.status_code == 200
    assert farmer_location.json()["latitude"] == 19.9975

    unrelated_client = type(client)(client.app)
    assert register(unrelated_client, "buyer@example.com", "BUYER").status_code == 201
    unrelated_location = unrelated_client.get(f"/api/v1/shipments/{shipment_id}/locations/latest")
    assert unrelated_location.status_code == 404


def test_reroute_requires_farmer_confirmation_and_writes_audit(client):
    assert register(client, "farmer@example.com", "FARMER").status_code == 201
    shipment_response = create_shipment(client)
    shipment_id = shipment_response.json()["id"]

    response = client.post(
        f"/api/v1/shipments/{shipment_id}/reroutes",
        json={"destination": "Thane Processing Unit", "reason": "Shorter ETA preserves the remaining shelf-life window."},
    )

    assert response.status_code == 201
    assert response.json()["originalDestination"] == "Pune Market"
    assert response.json()["recommendedDestination"] == "Thane Processing Unit"
    assert client.get(f"/api/v1/shipments/{shipment_id}").json()["status"] == "REROUTED"


def test_public_registration_cannot_create_admin(client):
    response = register(client, "admin@example.com", "ADMIN")

    assert response.status_code == 422


def test_business_registration_starts_unverified_and_cannot_publish_listing(client):
    add_test_crop_category()
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "wholesale@example.com",
            "fullName": "Regional Wholesale",
            "password": "correct horse battery staple",
            "role": "BUSINESS",
            "companyName": "Regional Wholesale Ltd",
            "businessType": "Wholesaler",
            "gstNumber": "27ABCDE1234F1Z5",
            "businessAddress": "Nashik, Maharashtra",
        },
    )

    assert response.status_code == 201
    assert sign_in(client, "wholesale@example.com").status_code == 200
    profile = client.get("/api/v1/business/profile")
    assert profile.status_code == 200
    assert profile.json()["isVerified"] is False
    with SessionLocal() as db:
        admin = User(
            email="review-admin@example.com",
            full_name="Review Admin",
            password_hash=hash_password("correct horse battery staple"),
            role="ADMIN",
        )
        db.add(admin)
        db.commit()
    admin_client = type(client)(client.app)
    assert admin_client.post(
        "/api/v1/auth/login",
        json={"email": "review-admin@example.com", "password": "correct horse battery staple"},
    ).status_code == 200
    refused_verification = admin_client.post(f"/api/v1/business/profiles/{profile.json()['id']}/verify")
    assert refused_verification.status_code == 409
    listing = client.post(
        "/api/v1/business/listings",
        json={
            "crop": "Tomato",
            "marketCategoryId": "tomato::TOM-01",
            "grade": "Grade A",
            "quantityKg": 1000,
            "minimumOrderKg": 100,
            "pricePerKg": 35,
            "pickupLocation": "Nashik Market Yard",
        },
    )
    assert listing.status_code == 403

    with SessionLocal() as db:
        saved_profile = db.query(BusinessProfile).filter_by(legal_name="Regional Wholesale Ltd").one()
        assert saved_profile.is_verified is False


def test_verified_businesses_can_list_negotiate_and_reserve_bulk_stock(client):
    add_test_crop_category()
    seller_client = type(client)(client.app)
    seller_registration = seller_client.post(
        "/api/v1/auth/register",
        json={
            "email": "seller@example.com",
            "fullName": "Produce Seller",
            "password": "correct horse battery staple",
            "role": "BUSINESS",
            "companyName": "Seller Farms Ltd",
            "businessType": "Farmer Group / FPO",
            "businessAddress": "Nashik, Maharashtra",
        },
    )
    assert seller_registration.status_code == 201
    assert sign_in(seller_client, "seller@example.com").status_code == 200
    with SessionLocal() as db:
        seller = db.scalar(select(User).where(User.email == "seller@example.com"))
        assert seller is not None
        seller.kyc_status = "VERIFIED"
        db.commit()
    seller_profile = seller_client.get("/api/v1/business/profile").json()

    with SessionLocal() as db:
        admin = User(
            email="admin@example.com",
            full_name="Admin",
            password_hash=hash_password("correct horse battery staple"),
            role="ADMIN",
        )
        db.add(admin)
        db.commit()

    admin_client = type(client)(client.app)
    assert admin_client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "correct horse battery staple"},
    ).status_code == 200
    pending_profiles = admin_client.get("/api/v1/business/profiles/pending")
    assert pending_profiles.status_code == 200
    assert seller_profile["id"] in {profile["id"] for profile in pending_profiles.json()}
    verification = admin_client.post(f"/api/v1/business/profiles/{seller_profile['id']}/verify")
    assert verification.status_code == 200

    listing = seller_client.post(
        "/api/v1/business/listings",
        json={
            "crop": "Tomato",
            "marketCategoryId": "tomato::TOM-01",
            "grade": "Grade A",
            "quantityKg": 1000,
            "minimumOrderKg": 100,
            "pricePerKg": 35,
            "pickupLocation": "Nashik Market Yard",
        },
    )
    assert listing.status_code == 201

    buyer_client = type(client)(client.app)
    buyer_registration = buyer_client.post(
        "/api/v1/auth/register",
        json={
            "email": "buyer-business@example.com",
            "fullName": "Retail Buyer",
            "password": "correct horse battery staple",
            "role": "BUSINESS",
            "companyName": "Retail Buyer Ltd",
            "businessType": "Retailer",
            "businessAddress": "Pune, Maharashtra",
        },
    )
    assert buyer_registration.status_code == 201
    assert sign_in(buyer_client, "buyer-business@example.com").status_code == 200
    with SessionLocal() as db:
        buyer = db.scalar(select(User).where(User.email == "buyer-business@example.com"))
        assert buyer is not None
        buyer.kyc_status = "VERIFIED"
        db.commit()
    buyer_profile = buyer_client.get("/api/v1/business/profile").json()
    assert admin_client.post(f"/api/v1/business/profiles/{buyer_profile['id']}/verify").status_code == 200

    order = buyer_client.post(
        "/api/v1/business/orders",
        json={"listingId": listing.json()["id"], "quantityKg": 500},
    )
    assert order.status_code == 201
    offer = seller_client.post(
        f"/api/v1/business/orders/{order.json()['id']}/offers",
        json={"pricePerKg": 33.5},
    )
    assert offer.status_code == 201
    accepted = buyer_client.post(f"/api/v1/business/orders/{order.json()['id']}/accept")
    assert accepted.status_code == 200
    assert accepted.json()["status"] == "ACCEPTED"

    transactions = buyer_client.get("/api/v1/business/transactions")
    assert transactions.status_code == 200
    assert transactions.json()[0]["crop"] == "Tomato"
    assert transactions.json()[0]["buyerName"] == "Retail Buyer"
    assert transactions.json()[0]["sellerName"] == "Produce Seller"
    assert transactions.json()[0]["totalValueInr"] == 16750
    assert transactions.json()[0]["paymentStatus"] == "NOT_RECORDED"
    assert seller_client.get("/api/v1/business/transactions").json()[0]["id"] == order.json()["id"]

    with SessionLocal() as db:
        stock = db.get(BusinessListing, listing.json()["id"])
        assert stock is not None
        assert stock.available_quantity_kg == 500


def test_insurance_application_is_farmer_only_and_limited_by_declared_value(client):
    assert register(client, "farmer@example.com", "FARMER").status_code == 201
    payload = {
        "crop": "Tomato",
        "coverageType": "TRANSIT",
        "insuredValueInr": 35000,
        "requestedCoverageInr": 36000,
        "origin": "Nashik Farm",
        "destination": "Pune Market",
        "harvestAt": datetime.now(UTC).isoformat(),
    }

    over_limit = client.post("/api/v1/insurance/applications", json=payload)
    assert over_limit.status_code == 422

    payload["requestedCoverageInr"] = 30000
    created = client.post("/api/v1/insurance/applications", json=payload)
    assert created.status_code == 201
    assert created.json()["status"] == "PENDING_REVIEW"
    assert len(client.get("/api/v1/insurance/applications").json()) == 1