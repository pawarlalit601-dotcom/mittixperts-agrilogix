BEGIN TRANSACTION;

CREATE TABLE alembic_version (
	version_num VARCHAR(32) NOT NULL, 
	CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
);

INSERT INTO "alembic_version" VALUES('78b4a0e6d112');

CREATE TABLE business_listings (
	id VARCHAR(36) NOT NULL, 
	seller_id VARCHAR(36) NOT NULL, 
	crop VARCHAR(80) NOT NULL, 
	variety VARCHAR(120) NOT NULL, 
	grade VARCHAR(80) NOT NULL, 
	quantity_kg FLOAT NOT NULL, 
	available_quantity_kg FLOAT NOT NULL, 
	minimum_order_kg FLOAT NOT NULL, 
	price_per_kg FLOAT NOT NULL, 
	pickup_location VARCHAR(240) NOT NULL, 
	status VARCHAR(24) NOT NULL, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, market_category_id VARCHAR(32), 
	PRIMARY KEY (id), 
	FOREIGN KEY(seller_id) REFERENCES users (id)
);

CREATE TABLE business_locations (
	id VARCHAR(36) NOT NULL, 
	business_id VARCHAR(36) NOT NULL, 
	label VARCHAR(80) NOT NULL, 
	address VARCHAR(500) NOT NULL, 
	created_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(business_id) REFERENCES business_profiles (id) ON DELETE CASCADE
);

CREATE TABLE business_negotiation_events (
	id VARCHAR(36) NOT NULL, 
	order_id VARCHAR(36) NOT NULL, 
	actor_id VARCHAR(36) NOT NULL, 
	price_per_kg FLOAT NOT NULL, 
	created_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(actor_id) REFERENCES users (id), 
	FOREIGN KEY(order_id) REFERENCES business_orders (id) ON DELETE CASCADE
);

CREATE TABLE business_orders (
	id VARCHAR(36) NOT NULL, 
	listing_id VARCHAR(36) NOT NULL, 
	buyer_id VARCHAR(36) NOT NULL, 
	seller_id VARCHAR(36) NOT NULL, 
	quantity_kg FLOAT NOT NULL, 
	current_offer_per_kg FLOAT NOT NULL, 
	status VARCHAR(24) NOT NULL, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(buyer_id) REFERENCES users (id), 
	FOREIGN KEY(listing_id) REFERENCES business_listings (id), 
	FOREIGN KEY(seller_id) REFERENCES users (id)
);

CREATE TABLE business_profiles (
	id VARCHAR(36) NOT NULL, 
	user_id VARCHAR(36) NOT NULL, 
	legal_name VARCHAR(180) NOT NULL, 
	business_type VARCHAR(48) NOT NULL, 
	gst_number VARCHAR(15), 
	address VARCHAR(500) NOT NULL, 
	contact_phone VARCHAR(32), 
	is_verified BOOLEAN NOT NULL, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
	UNIQUE (gst_number)
);

INSERT INTO "business_profiles" VALUES('65a14309-d9d1-4553-a776-d41e4fc02874','ca3edbdb-adef-4baf-a948-6a4c52975e5c','Preview Logistics Traders Ltd','Wholesaler',NULL,'Nashik, Maharashtra',NULL,0,'2026-09-29 10:24:36.196151','2026-09-29 10:24:36.196156');

CREATE TABLE "business_transport_quotes" (
	id VARCHAR(36) NOT NULL, 
	request_id VARCHAR(36) NOT NULL, 
	carrier_id VARCHAR(36) NOT NULL, 
	price_inr FLOAT NOT NULL, 
	vehicle_count INTEGER NOT NULL, 
	estimated_hours FLOAT NOT NULL, 
	status VARCHAR(24) NOT NULL, 
	created_at DATETIME NOT NULL, 
	vehicle_type VARCHAR(48) DEFAULT 'unspecified' NOT NULL, 
	refrigerated BOOLEAN DEFAULT 0 NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(carrier_id) REFERENCES users (id), 
	FOREIGN KEY(request_id) REFERENCES business_transport_requests (id) ON DELETE CASCADE
);

CREATE TABLE "business_transport_requests" (
	id VARCHAR(36) NOT NULL, 
	requester_id VARCHAR(36) NOT NULL, 
	pickup VARCHAR(240) NOT NULL, 
	destination VARCHAR(240) NOT NULL, 
	quantity_kg FLOAT NOT NULL, 
	truck_count INTEGER NOT NULL, 
	delivery_at DATETIME NOT NULL, 
	status VARCHAR(24) NOT NULL, 
	created_at DATETIME NOT NULL, 
	shipment_id VARCHAR(36), 
	preferred_vehicle_type VARCHAR(48), 
	cargo_volume_m3 FLOAT, 
	refrigerated BOOLEAN DEFAULT 0 NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT fk_business_transport_requests_shipment_id_shipments FOREIGN KEY(shipment_id) REFERENCES shipments (id) ON DELETE SET NULL, 
	FOREIGN KEY(requester_id) REFERENCES users (id)
);

CREATE TABLE crop_market_categories (
	category_id VARCHAR(32) NOT NULL, 
	source_category_id VARCHAR(32) NOT NULL, 
	crop VARCHAR(80) NOT NULL, 
	valid_market_category VARCHAR(160) NOT NULL, 
	eligibility_rule VARCHAR(16) NOT NULL, 
	recommendation_use TEXT NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (category_id), 
	CONSTRAINT uq_crop_market_category_source UNIQUE (crop, source_category_id)
);

CREATE TABLE insurance_applications (
	id VARCHAR(36) NOT NULL, 
	farmer_id VARCHAR(36) NOT NULL, 
	shipment_id VARCHAR(36), 
	crop VARCHAR(80) NOT NULL, 
	coverage_type VARCHAR(32) NOT NULL, 
	insured_value_inr FLOAT NOT NULL, 
	requested_coverage_inr FLOAT NOT NULL, 
	origin VARCHAR(240) NOT NULL, 
	destination VARCHAR(240) NOT NULL, 
	harvest_at DATETIME NOT NULL, 
	notes TEXT NOT NULL, 
	status VARCHAR(24) NOT NULL, 
	review_notes TEXT NOT NULL, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(farmer_id) REFERENCES users (id), 
	FOREIGN KEY(shipment_id) REFERENCES shipments (id)
);

CREATE TABLE kyc_applications (
	id VARCHAR(36) NOT NULL, 
	application_number VARCHAR(32) NOT NULL, 
	user_id VARCHAR(36) NOT NULL, 
	account_type VARCHAR(24) NOT NULL, 
	status VARCHAR(24) NOT NULL, 
	encrypted_profile BLOB NOT NULL, 
	completion_percent INTEGER NOT NULL, 
	submitted_at DATETIME, 
	reviewer_id VARCHAR(36), 
	review_note TEXT, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(reviewer_id) REFERENCES users (id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
	UNIQUE (application_number)
);

INSERT INTO "kyc_applications" VALUES('4acfee11-b43e-4713-bb7d-cf1a55f78e04','AGX-KYC-EC02AB60','0fcafc23-3280-4507-935c-e5320e12b394','FARMER','DRAFT',X'9CABE8B6AC72D83C65076F5C46432440F0F1324A80076922210A8A19FE020FDC21A8407CDBA8871DAFAD62ADCE46934B605B257D47F17B28DBF522C7D4042595BF8A82C01ACA7E53D3612EFC28F19C7BA26D6FE3A177F5400AADA4ED4D816E1753C00C2BFC35E8EF84E9ABEB500F385D79AD0A42281BFC0B30FD63BA21190B79296A77AC65F2194D7ACF427E90A63C4E2FF5455CDF8645943F2F86B317D27AB2E2CEAE20C201C708A7D0C4823539922E7CEA1D9B9FA34CBFC219E52A7E22D9F53D88D69177C40BCAB134E4DDC9A130316397FAEAA7A8D62BB407BE3D129B01F8BEE7B8DA1BA42BBF45FC32B99EB6EF97AFCCE129C627D1ECD57C02C1F085ADFFE26C80D46C94A947FED7FD184BB7CB6B89C3CBCC761E911E5CEFE8E1FCA453FA06C488F785C60320611503A28C68C1BD571305D9CCC7D6F2FAC0B59529729854F587D490F90CC5986750982029CB943247A33C9CAA82D6FB8D6C7EC4063AA332D36D6CE9FCEAAD7C66042CC44C1B7F31661B254080DBFAD8E97D150582844B1E03C0CBC20A627023188D080A633463BD6D878CD87BA7FCDE5B2832DB40F20C7A93ADE4BBF9AED7480A8C1AE1A2FF5DE22972B52401E60DC7B2339AF969A59FFB0AC36573CFF92A746631339A8BB865F71411C8DBE04EB4CAB05B118BDBB773F3D2A2D27C0492CD5004245FC610E572A889D316F47786E33E4BA712BC938E0788D31D963DE5B58B43CBF38384170BA7AE1F28D3FF5C0C365D3A82C6E9AE1A576CC407226D48911DF48511C1FD7DFA14BE69B07FCA4193B969C818BD4C437B858089D2B4FE09B000',61,NULL,NULL,NULL,'2026-09-30 05:39:05.046432','2026-09-30 05:40:35.935548');

INSERT INTO "kyc_applications" VALUES('61f1982c-0943-4a0b-80c8-d19e0fbd9ac8','AGX-KYC-622F9874','19b5555d-47ce-48f2-9711-740ae0ee9076','FARMER','DRAFT',X'CA3971D42299DE0D5E281B7C36FBB058A12EC2371FA7FC9E9BE7D2670B5D092A8FC02283AC607D7685217EC04B99D73B19D26F4607A0E6D5E569584788908BAA0C27084FBECEBBA3EA6E50C80A6E4E1CE69B3595B6F7693E15DCDABFD44C0AA40ADA9A4210C02D9C18A3D4E021EA148A072CB940C9F7CA367CCB24353DD13266E8C6B3526A8C02059093C9E37A1E8281757597A5F29C4C0C3BB5EFF3556F090FD7B6B6CB7120142132252496D6E1D860D7897176C83D2C781580639C68B11E6B4F16EDC2D8AD3DD2F6C61BC24E73B9D4BB201F0EAB66E22EA1CBC5199A0CB83098C4C6861A7BB951FBB1792E3A9A47A25E95658838D4E6479329F572913C910B08382F82E85FB2B2A24D311E36C589237FC66E6749339BBC1D81D726DD1C6E33A1742578F498A5C60BDDE7756E7B12A9687A267D445E3A29AF754402180508718FA4CB6E8668BDA47ED55A061DC7E22A783B64D2380D54FE361DEF5A7918AA265AB5ED6CCA54E756F9D4E2B89AFC947981F119D5611796644A961C777ABF38E37B1C243960FF1B8F4337D16274FEA7DC6CBFDF865B5BA00F927639E24EDC8809D61B555F0280255CC4FE97E32E9F7D0A87FBAB7E16A9E33DD1CE5B141784486BBBE1AF0C44A15353D41CD764ADB6D6C84C30D3456D93D16732763C69A918AD50D4BAD576A6F10D474CE931E5DA3B5BF72F31F65E16094DAF84F752586A7D583AD6A3692958C87DE7B36092E5A466135856A3F04BA1A4AE96909EE61B7BA4E8AA18F0ED98967A1B4D29E6851BD14C0FCE861779F1E5E1893E7D64DC0970234DA562BCB89492035500A6182BCFE443FBE04F16CA4E96727DBFE3BA9DC6745E6C387E5870F1BFD93AFA1E4A242B2658FA1DB3',75,NULL,NULL,NULL,'2026-09-30 05:43:27.938479','2026-09-30 05:58:18.949923');

INSERT INTO "kyc_applications" VALUES('632cf5bf-4480-45f2-b6ba-a5f88e5e0135','AGX-KYC-1D47B00C','47467fe2-3288-4110-a635-eb4e2511405e','FARMER','DRAFT',X'D546D1CA06DBDB4621B1EAFA1D4F14245407C5299213A4412704867B937E8E101A94962778A416E4DE11F0B3E57BE0DF06D7B9505BD0878BB9BF14914742440A379A0E5C5A617CAF353EA5287C0947517B1CB8C9E50AB290D6420B57D3D88D958F43ABFF894CFD16D62082923993510251A02B262A06CDC4E7E403972B8EF993CACFCC6B0CB9936198432FE777861C0AF1F77068B247F40E088BA41C323EE75190BD1DD389B2D4FBA0FA1E323B',0,NULL,NULL,NULL,'2026-09-30 15:50:44.748341','2026-09-30 15:50:44.755342');

CREATE TABLE kyc_audit_events (
	id VARCHAR(36) NOT NULL, 
	application_id VARCHAR(36) NOT NULL, 
	actor_id VARCHAR(36) NOT NULL, 
	event_type VARCHAR(40) NOT NULL, 
	detail TEXT NOT NULL, 
	created_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(application_id) REFERENCES kyc_applications (id) ON DELETE CASCADE, 
	FOREIGN KEY(actor_id) REFERENCES users (id)
);

INSERT INTO "kyc_audit_events" VALUES('7cbebf3b-0a90-483d-bba4-cc6b6596562a','4acfee11-b43e-4713-bb7d-cf1a55f78e04','0fcafc23-3280-4507-935c-e5320e12b394','PROFILE_SAVED','','2026-09-30 05:39:05.076672');

INSERT INTO "kyc_audit_events" VALUES('89f27e19-d273-4bec-83f3-c83dcc083650','4acfee11-b43e-4713-bb7d-cf1a55f78e04','0fcafc23-3280-4507-935c-e5320e12b394','PROFILE_SAVED','','2026-09-30 05:40:35.950668');

INSERT INTO "kyc_audit_events" VALUES('b9543bd5-6b56-408c-b10d-0ae14f40d666','4acfee11-b43e-4713-bb7d-cf1a55f78e04','0fcafc23-3280-4507-935c-e5320e12b394','DOCUMENT_UPLOADED','IDENTITY','2026-09-30 05:40:46.596013');

INSERT INTO "kyc_audit_events" VALUES('64abef54-b91e-49cc-ab5a-a5b11f6bf893','4acfee11-b43e-4713-bb7d-cf1a55f78e04','0fcafc23-3280-4507-935c-e5320e12b394','DOCUMENT_UPLOADED','BANK_PROOF','2026-09-30 05:40:53.764900');

INSERT INTO "kyc_audit_events" VALUES('cf40a898-b511-4eec-b68c-4d26cebad22b','4acfee11-b43e-4713-bb7d-cf1a55f78e04','0fcafc23-3280-4507-935c-e5320e12b394','DOCUMENT_UPLOADED','PAN','2026-09-30 05:41:00.200345');

INSERT INTO "kyc_audit_events" VALUES('9852c92c-ab97-412f-b832-e708303d2da4','61f1982c-0943-4a0b-80c8-d19e0fbd9ac8','19b5555d-47ce-48f2-9711-740ae0ee9076','REGISTRATION_PROFILE_SEEDED','','2026-09-30 05:43:27.942384');

INSERT INTO "kyc_audit_events" VALUES('d187eb8b-a974-4121-b63a-c38ef4230f35','61f1982c-0943-4a0b-80c8-d19e0fbd9ac8','19b5555d-47ce-48f2-9711-740ae0ee9076','PROFILE_SAVED','','2026-09-30 05:58:18.952146');

INSERT INTO "kyc_audit_events" VALUES('ada67727-c04d-4d4c-bc2b-178a81300c01','632cf5bf-4480-45f2-b6ba-a5f88e5e0135','47467fe2-3288-4110-a635-eb4e2511405e','REGISTRATION_PROFILE_SEEDED','','2026-09-30 15:50:44.757022');

CREATE TABLE kyc_document_access_logs (
	id VARCHAR(36) NOT NULL, 
	document_id VARCHAR(36) NOT NULL, 
	viewer_id VARCHAR(36) NOT NULL, 
	action VARCHAR(24) NOT NULL, 
	accessed_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(document_id) REFERENCES kyc_documents (id) ON DELETE CASCADE, 
	FOREIGN KEY(viewer_id) REFERENCES users (id)
);

CREATE TABLE kyc_documents (
	id VARCHAR(36) NOT NULL, 
	application_id VARCHAR(36) NOT NULL, 
	vehicle_id VARCHAR(36), 
	document_type VARCHAR(48) NOT NULL, 
	original_filename VARCHAR(180) NOT NULL, 
	content_type VARCHAR(80) NOT NULL, 
	storage_key VARCHAR(64) NOT NULL, 
	size_bytes INTEGER NOT NULL, 
	status VARCHAR(24) NOT NULL, 
	expires_at DATETIME, 
	review_reason TEXT, 
	reviewed_by VARCHAR(36), 
	uploaded_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(application_id) REFERENCES kyc_applications (id) ON DELETE CASCADE, 
	FOREIGN KEY(vehicle_id) REFERENCES kyc_vehicles (id) ON DELETE CASCADE, 
	FOREIGN KEY(reviewed_by) REFERENCES users (id), 
	UNIQUE (storage_key)
);

INSERT INTO "kyc_documents" VALUES('6f4addb4-998c-4d22-9f28-7855db3d1b1b','4acfee11-b43e-4713-bb7d-cf1a55f78e04',NULL,'IDENTITY','WhatsApp Image 2026-09-30 at 10.39.38 AM.jpeg','image/jpeg','14399fbd044d435e86f496e746822982',43287,'UPLOADED',NULL,NULL,NULL,'2026-09-30 05:40:46.604658');

INSERT INTO "kyc_documents" VALUES('56850a2e-1eff-4049-9631-fde428bfd51e','4acfee11-b43e-4713-bb7d-cf1a55f78e04',NULL,'BANK_PROOF','WhatsApp Image 2026-09-30 at 10.39.38 AM.jpeg','image/jpeg','486f7716682240699dc7b99f1e182285',43287,'UPLOADED',NULL,NULL,NULL,'2026-09-30 05:40:53.768028');

INSERT INTO "kyc_documents" VALUES('15b37cbd-e401-4338-a3bf-e0d07e4e43e0','4acfee11-b43e-4713-bb7d-cf1a55f78e04',NULL,'PAN','WhatsApp Image 2026-09-30 at 10.39.38 AM.jpeg','image/jpeg','1d0d1cdf6a1a417cae2996152aa4483d',43287,'UPLOADED',NULL,NULL,NULL,'2026-09-30 05:41:00.203744');

CREATE TABLE kyc_vehicles (
	id VARCHAR(36) NOT NULL, 
	owner_id VARCHAR(36) NOT NULL, 
	encrypted_details BLOB NOT NULL, 
	status VARCHAR(24) NOT NULL, 
	created_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(owner_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE reroute_audits (
	id VARCHAR(36) NOT NULL, 
	shipment_id VARCHAR(36) NOT NULL, 
	actor_id VARCHAR(36) NOT NULL, 
	original_destination VARCHAR(240) NOT NULL, 
	recommended_destination VARCHAR(240) NOT NULL, 
	reason TEXT NOT NULL, 
	approved_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(actor_id) REFERENCES users (id), 
	FOREIGN KEY(shipment_id) REFERENCES shipments (id) ON DELETE CASCADE
);

CREATE TABLE shipment_locations (
	id INTEGER NOT NULL, 
	shipment_id VARCHAR(36) NOT NULL, 
	driver_id VARCHAR(36) NOT NULL, 
	latitude FLOAT NOT NULL, 
	longitude FLOAT NOT NULL, 
	accuracy_meters FLOAT, 
	speed_kmh FLOAT, 
	recorded_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(driver_id) REFERENCES users (id), 
	FOREIGN KEY(shipment_id) REFERENCES shipments (id) ON DELETE CASCADE
);

CREATE TABLE shipments (
	id VARCHAR(36) NOT NULL, 
	tracking_number VARCHAR(48) NOT NULL, 
	farmer_id VARCHAR(36) NOT NULL, 
	driver_id VARCHAR(36), 
	buyer_id VARCHAR(36), 
	crop VARCHAR(80) NOT NULL, 
	variety VARCHAR(120) NOT NULL, 
	quantity_kg FLOAT NOT NULL, 
	harvest_at DATETIME NOT NULL, 
	expected_shelf_life_hours FLOAT NOT NULL, 
	quality_grade VARCHAR(80) NOT NULL, 
	storage_condition VARCHAR(120) NOT NULL, 
	origin VARCHAR(240) NOT NULL, 
	destination VARCHAR(240) NOT NULL, 
	status VARCHAR(32) NOT NULL, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, vehicle_type VARCHAR(48), cargo_volume_m3 FLOAT, 
	PRIMARY KEY (id), 
	FOREIGN KEY(buyer_id) REFERENCES users (id), 
	FOREIGN KEY(driver_id) REFERENCES users (id), 
	FOREIGN KEY(farmer_id) REFERENCES users (id), 
	UNIQUE (tracking_number)
);

CREATE TABLE users (
	id VARCHAR(36) NOT NULL, 
	email VARCHAR(320) NOT NULL, 
	full_name VARCHAR(120) NOT NULL, 
	password_hash VARCHAR(255) NOT NULL, 
	role VARCHAR(16) NOT NULL, 
	is_active BOOLEAN NOT NULL, 
	created_at DATETIME NOT NULL, account_type VARCHAR(24), preferred_language VARCHAR(5) DEFAULT 'en' NOT NULL, mobile_number VARCHAR(20), mobile_verified BOOLEAN DEFAULT 0 NOT NULL, kyc_status VARCHAR(24) DEFAULT 'NOT_STARTED' NOT NULL, transporter_id VARCHAR(36), service_area VARCHAR(120), preferred_pickup_area VARCHAR(120), 
	PRIMARY KEY (id), 
	UNIQUE (email)
);

INSERT INTO "users" VALUES('ca3edbdb-adef-4baf-a948-6a4c52975e5c','agrilogix-preview-b2b@example.com','Preview Business Account','$argon2id$v=19$m=65536,t=3,p=4$hEacBwfHykgTb5MjtJVU7Q$ikBRQslppABLunuCTI05BbEh+4N6YHgO8MozWl2Vml4','BUSINESS',1,'2026-09-29 10:24:36.188871','WHOLESALER','en',NULL,0,'NOT_STARTED',NULL,NULL,NULL);

INSERT INTO "users" VALUES('07180ea7-1d1e-4b73-89db-d0b03903db7c','farmer@agrilogix.io','Lalit pawar','$argon2id$v=19$m=65536,t=3,p=4$Wdvfm7nX9blYIsrR1HvBSA$syOVMB/UfzHnJs3BULyKfSricq4cVWVgU3n0CXAh2zc','FARMER',1,'2026-09-29 10:30:34.549842','FARMER','en',NULL,0,'NOT_STARTED',NULL,NULL,NULL);

INSERT INTO "users" VALUES('acca6290-5699-445e-a484-39b34a392210','pawarlalit601@gmail.com','lalit Pawar','$argon2id$v=19$m=65536,t=3,p=4$g/G+D2mppBmvSMDP7vhC1w$QvOHFJzkAGvUKJcyMQu11TxgiahrYOHs2Jz84tzpzQA','FARMER',1,'2026-09-29 14:36:58.489135','FARMER','en',NULL,0,'NOT_STARTED',NULL,NULL,NULL);

INSERT INTO "users" VALUES('0fcafc23-3280-4507-935c-e5320e12b394','harshpatil022006@gmail.com','Harsh Patil','$argon2id$v=19$m=65536,t=3,p=4$p+k3FEGVegvlac/R4rbVNA$RoWqFcPtISr5umNUvY/W8X7GrBapQdgJMRiXrGWYsYY','FARMER',1,'2026-09-29 14:48:46.079321','FARMER','en',NULL,0,'NOT_STARTED',NULL,NULL,NULL);

INSERT INTO "users" VALUES('19b5555d-47ce-48f2-9711-740ae0ee9076','kyc-flow-1790747007546@example.com','KYC Flow Farmer','$argon2id$v=19$m=65536,t=3,p=4$TTZCYcRd+zGSIfZPLGw7Gw$wWHigz8jAxmWBn0qkIRyzcyvQvnHdy+Mk5N0t5MCXH4','FARMER',1,'2026-09-30 05:43:27.928366','FARMER','en','+919812345678',0,'NOT_STARTED',NULL,NULL,NULL);

INSERT INTO "users" VALUES('60c62df9-4475-4761-9f71-7f90931234b4','demo@agrilogix.ai','Demo User','$argon2id$v=19$m=65536,t=3,p=4$8a2V9uNG2VLdTNZLlkAuqg$6sULRyOWVVobtrbmWheFWlD+H/wStlP+8fqhVGGeP6o','FARMER',1,'2026-09-30 08:13:23.048033','FARMER','en',NULL,0,'NOT_STARTED',NULL,'Bangalore','Bangalore');

INSERT INTO "users" VALUES('47467fe2-3288-4110-a635-eb4e2511405e','sandeshpawar601@gmail.com','sandesh pawar','$argon2id$v=19$m=65536,t=3,p=4$KJurR6PbM+MobWhp3/7E5g$uLDHxeC1uZWRa9gSLKW35UOkxT+1QPY+hm26uY/5vec','FARMER',1,'2026-09-30 15:50:44.736801','FARMER','en','7030251179',0,'NOT_STARTED',NULL,'jalgaon','kasoda');

CREATE TABLE vehicle_availability (
	id VARCHAR(36) NOT NULL, 
	owner_id VARCHAR(36) NOT NULL, 
	driver_id VARCHAR(36), 
	vehicle_number VARCHAR(32) NOT NULL, 
	vehicle_type VARCHAR(48) NOT NULL, 
	current_location VARCHAR(240) NOT NULL, 
	pickup_area VARCHAR(120) NOT NULL, 
	destination VARCHAR(120) NOT NULL, 
	route VARCHAR(500) NOT NULL, 
	available_capacity FLOAT NOT NULL, 
	total_capacity FLOAT NOT NULL, 
	rate_inr FLOAT NOT NULL, 
	refrigerated BOOLEAN NOT NULL, 
	departure_time DATETIME NOT NULL, 
	estimated_arrival_time DATETIME, 
	status VARCHAR(24) NOT NULL, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(owner_id) REFERENCES users (id) ON DELETE CASCADE, 
	FOREIGN KEY(driver_id) REFERENCES users (id) ON DELETE SET NULL, 
	UNIQUE (vehicle_number)
);

CREATE TABLE vehicle_bookings (
	id VARCHAR(36) NOT NULL, 
	vehicle_id VARCHAR(36) NOT NULL, 
	requester_id VARCHAR(36) NOT NULL, 
	shipment_id VARCHAR(36), 
	requested_capacity_kg FLOAT NOT NULL, 
	status VARCHAR(24) NOT NULL, 
	created_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(vehicle_id) REFERENCES vehicle_availability (id) ON DELETE CASCADE, 
	FOREIGN KEY(requester_id) REFERENCES users (id), 
	FOREIGN KEY(shipment_id) REFERENCES shipments (id) ON DELETE SET NULL
);

CREATE TABLE vehicle_notifications (
	id VARCHAR(36) NOT NULL, 
	user_id VARCHAR(36) NOT NULL, 
	vehicle_id VARCHAR(36) NOT NULL, 
	event_type VARCHAR(32) NOT NULL, 
	title VARCHAR(120) NOT NULL, 
	message VARCHAR(500) NOT NULL, 
	is_read BOOLEAN NOT NULL, 
	created_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
	FOREIGN KEY(vehicle_id) REFERENCES vehicle_availability (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX ix_users_email ON users (email);

CREATE INDEX ix_users_role ON users (role);

CREATE INDEX ix_shipments_buyer_id ON shipments (buyer_id);

CREATE INDEX ix_shipments_crop ON shipments (crop);

CREATE INDEX ix_shipments_driver_id ON shipments (driver_id);

CREATE INDEX ix_shipments_farmer_id ON shipments (farmer_id);

CREATE INDEX ix_shipments_status ON shipments (status);

CREATE UNIQUE INDEX ix_shipments_tracking_number ON shipments (tracking_number);

CREATE INDEX ix_reroute_audits_actor_id ON reroute_audits (actor_id);

CREATE INDEX ix_reroute_audits_shipment_id ON reroute_audits (shipment_id);

CREATE INDEX ix_shipment_locations_driver_id ON shipment_locations (driver_id);

CREATE INDEX ix_shipment_locations_recorded_at ON shipment_locations (recorded_at);

CREATE INDEX ix_shipment_locations_shipment_id ON shipment_locations (shipment_id);

CREATE INDEX ix_shipment_locations_shipment_recorded ON shipment_locations (shipment_id, recorded_at);

CREATE INDEX ix_business_listings_crop ON business_listings (crop);

CREATE INDEX ix_business_listings_seller_id ON business_listings (seller_id);

CREATE INDEX ix_business_listings_status ON business_listings (status);

CREATE INDEX ix_business_listings_status_crop ON business_listings (status, crop);

CREATE INDEX ix_business_profiles_is_verified ON business_profiles (is_verified);

CREATE UNIQUE INDEX ix_business_profiles_user_id ON business_profiles (user_id);

CREATE INDEX ix_business_locations_business_id ON business_locations (business_id);

CREATE INDEX ix_business_orders_buyer_id ON business_orders (buyer_id);

CREATE INDEX ix_business_orders_listing_id ON business_orders (listing_id);

CREATE INDEX ix_business_orders_seller_id ON business_orders (seller_id);

CREATE INDEX ix_business_orders_status ON business_orders (status);

CREATE INDEX ix_business_negotiation_events_actor_id ON business_negotiation_events (actor_id);

CREATE INDEX ix_business_negotiation_events_order_id ON business_negotiation_events (order_id);

CREATE INDEX ix_insurance_applications_farmer_id ON insurance_applications (farmer_id);

CREATE INDEX ix_insurance_applications_shipment_id ON insurance_applications (shipment_id);

CREATE INDEX ix_insurance_applications_status ON insurance_applications (status);

CREATE INDEX ix_users_account_type ON users (account_type);

CREATE INDEX ix_users_mobile_number ON users (mobile_number);

CREATE INDEX ix_users_kyc_status ON users (kyc_status);

CREATE INDEX ix_users_transporter_id ON users (transporter_id);

CREATE UNIQUE INDEX ix_kyc_applications_application_number ON kyc_applications (application_number);

CREATE INDEX ix_kyc_applications_user_id ON kyc_applications (user_id);

CREATE INDEX ix_kyc_applications_account_type ON kyc_applications (account_type);

CREATE INDEX ix_kyc_applications_status ON kyc_applications (status);

CREATE INDEX ix_kyc_applications_status_created ON kyc_applications (status, created_at);

CREATE INDEX ix_kyc_vehicles_owner_id ON kyc_vehicles (owner_id);

CREATE INDEX ix_kyc_vehicles_status ON kyc_vehicles (status);

CREATE INDEX ix_kyc_documents_application_id ON kyc_documents (application_id);

CREATE INDEX ix_kyc_documents_vehicle_id ON kyc_documents (vehicle_id);

CREATE INDEX ix_kyc_documents_document_type ON kyc_documents (document_type);

CREATE INDEX ix_kyc_documents_status ON kyc_documents (status);

CREATE INDEX ix_kyc_documents_expires_at ON kyc_documents (expires_at);

CREATE INDEX ix_kyc_documents_application_type ON kyc_documents (application_id, document_type);

CREATE INDEX ix_kyc_audit_events_application_id ON kyc_audit_events (application_id);

CREATE INDEX ix_kyc_audit_events_actor_id ON kyc_audit_events (actor_id);

CREATE INDEX ix_kyc_audit_events_event_type ON kyc_audit_events (event_type);

CREATE INDEX ix_kyc_audit_events_created_at ON kyc_audit_events (created_at);

CREATE INDEX ix_kyc_document_access_logs_document_id ON kyc_document_access_logs (document_id);

CREATE INDEX ix_kyc_document_access_logs_viewer_id ON kyc_document_access_logs (viewer_id);

CREATE INDEX ix_kyc_document_access_logs_accessed_at ON kyc_document_access_logs (accessed_at);

CREATE INDEX ix_crop_market_categories_crop ON crop_market_categories (crop);

CREATE INDEX ix_crop_market_categories_eligibility_rule ON crop_market_categories (eligibility_rule);

CREATE INDEX ix_business_listings_market_category_id ON business_listings (market_category_id);

CREATE INDEX ix_business_transport_requests_requester_id ON business_transport_requests (requester_id);

CREATE INDEX ix_business_transport_requests_status ON business_transport_requests (status);

CREATE INDEX ix_business_transport_requests_shipment_id ON business_transport_requests (shipment_id);

CREATE INDEX ix_business_transport_quotes_status ON business_transport_quotes (status);

CREATE INDEX ix_business_transport_quotes_carrier_id ON business_transport_quotes (carrier_id);

CREATE INDEX ix_business_transport_quotes_request_id ON business_transport_quotes (request_id);

CREATE INDEX ix_users_service_area ON users (service_area);

CREATE INDEX ix_users_preferred_pickup_area ON users (preferred_pickup_area);

CREATE INDEX ix_vehicle_availability_owner_id ON vehicle_availability (owner_id);

CREATE INDEX ix_vehicle_availability_driver_id ON vehicle_availability (driver_id);

CREATE INDEX ix_vehicle_availability_vehicle_number ON vehicle_availability (vehicle_number);

CREATE INDEX ix_vehicle_availability_vehicle_type ON vehicle_availability (vehicle_type);

CREATE INDEX ix_vehicle_availability_pickup_area ON vehicle_availability (pickup_area);

CREATE INDEX ix_vehicle_availability_destination ON vehicle_availability (destination);

CREATE INDEX ix_vehicle_availability_refrigerated ON vehicle_availability (refrigerated);

CREATE INDEX ix_vehicle_availability_departure_time ON vehicle_availability (departure_time);

CREATE INDEX ix_vehicle_availability_status ON vehicle_availability (status);

CREATE INDEX ix_vehicle_availability_area_status_departure ON vehicle_availability (pickup_area, status, departure_time);

CREATE INDEX ix_vehicle_bookings_vehicle_id ON vehicle_bookings (vehicle_id);

CREATE INDEX ix_vehicle_bookings_requester_id ON vehicle_bookings (requester_id);

CREATE INDEX ix_vehicle_bookings_shipment_id ON vehicle_bookings (shipment_id);

CREATE INDEX ix_vehicle_bookings_status ON vehicle_bookings (status);

CREATE INDEX ix_vehicle_notifications_user_id ON vehicle_notifications (user_id);

CREATE INDEX ix_vehicle_notifications_vehicle_id ON vehicle_notifications (vehicle_id);

CREATE INDEX ix_vehicle_notifications_event_type ON vehicle_notifications (event_type);

CREATE INDEX ix_vehicle_notifications_is_read ON vehicle_notifications (is_read);

CREATE INDEX ix_vehicle_notifications_created_at ON vehicle_notifications (created_at);

CREATE INDEX ix_vehicle_notifications_user_created ON vehicle_notifications (user_id, created_at);

COMMIT;