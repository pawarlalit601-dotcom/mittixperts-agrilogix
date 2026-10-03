# AgriLogix API

FastAPI service for identity, shipment access, private driver-location updates, business-to-business orders, and insurance application intake.

## Local development

1. Install `uv` and Python 3.12 or newer.
2. Copy `.env.example` to `.env`, set `JWT_SECRET_KEY` to a newly generated secret, and set `GOOGLE_CLIENT_ID` to your Google OAuth 2.0 web client ID. Set `GEMINI_API_KEY` on the backend to enable the farmer produce scanner; never place this key in frontend environment variables. Do not reuse the example secret.
3. From this directory, run `uv sync`, then `uv run alembic upgrade head`.
4. Run `uv run python -m app.create_admin` to provision the first administrator interactively.
5. Start the API with `uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000`.
6. Start the frontend from the repository root; Vite proxies `/api` and `/ws` to the API.

For local Google sign-in, set the same OAuth 2.0 web client ID as `VITE_GOOGLE_CLIENT_ID` in the frontend `.env.local`, and authorize `http://localhost:3000` and `http://127.0.0.1:3000` as JavaScript origins in Google Cloud Console.

The local default database is SQLite for quick development. Set `DATABASE_URL` to PostgreSQL to exercise production persistence. Schema changes are managed only through Alembic migrations.

The farmer's Freshness AI screen includes an authenticated harvested-produce image scanner. It accepts JPEG, PNG, and WebP images up to 10 MB. Gemini returns visual observations only; configured commodity profiles and Agrilogix grading and logistics rules calculate the grade, estimated shelf life, spoilage risk, and route recommendation. Override the backend `GEMINI_MODEL` setting if a different vision model is enabled for your API key.

## PostgreSQL with Compose

Create a root `.env` file with `POSTGRES_PASSWORD`, a cryptographically random `JWT_SECRET_KEY`, and the public web origin in `CORS_ORIGINS`; set `GEMINI_API_KEY` there to enable the scanner in Compose. The root `.env` is ignored by Git. Then run `docker compose up --build`. Use an alphanumeric/hex database password to avoid URL-encoding problems in the compose connection string. The API applies migrations before starting.

## Render API and Vercel frontend

Create a Render Blueprint from `render.yaml` to deploy the API and PostgreSQL database. Set the requested `GEMINI_API_KEY` and `KYC_ENCRYPTION_KEY` secrets in Render; the latter must be a URL-safe base64 encoding of 32 random bytes. The free Render database is intended for preview deployments and may expire; use a paid persistent database for production.

Create a Vercel project from the same repository and set its Root Directory to `frontend`. The included `frontend/vercel.json` forwards `/api/*` requests to the Render API. The Render service name in that rewrite must match the deployed API URL. Configure `VITE_GOOGLE_MAPS_API_KEY` and, if Google sign-in is enabled, `VITE_GOOGLE_CLIENT_ID` in Vercel project environment variables.

## Security boundaries

- Public registration is limited to farmer, driver, buyer, and business roles. Admins are provisioned using the CLI.
- Passwords are Argon2-hashed. Access tokens are HttpOnly cookies; cookies are marked Secure when `APP_ENV=production`.
- Exact shipment coordinates are returned only to the assigned driver, shipment farmer, or administrator. Buyers do not receive precise driver coordinates.
- Business accounts are unverified by default. Listing, ordering, and transport booking require administrative verification. Only verified transport-company profiles may submit carrier quotes.
- Insurance applications are intake records only. A licensed insurer must underwrite and issue a policy; this API does not create coverage or process claims.

## Production work still required

Deploy behind HTTPS and a same-origin reverse proxy, restrict Google Maps keys by API and domain, add rate limiting and monitoring, configure backups and secret rotation, complete a security review, and integrate a licensed insurance provider plus payment/invoice services. Live route Directions also requires Google Routes/Directions billing and enabled APIs.