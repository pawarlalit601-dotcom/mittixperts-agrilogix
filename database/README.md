# AgriLogix Database

This folder contains the database schemas, SQLite data store, migrations, and seed data for the AgriLogix platform.

## Contents

- **`agrilogix.db`**: Local SQLite database populated with initialized tables, KYC data, users, and crop market categories.
- **`schema.sql`**: Complete SQL schema dump (tables, columns, indexes, and constraints).
- **`init.sql`**: PostgreSQL initialization script for Docker / production container startup.
- **`migrations/`**: Alembic migration scripts and version history (`versions/`).
- **`data/`**: Raw master data files (`Crop_Market_Category_Master_40_Crops.xlsx`).
- **`seeds/`**: Seed scripts to populate initial categories and data.
- **`docker-compose.db.yml`**: Standalone Docker Compose service for spinning up PostgreSQL.

## Usage

### Local SQLite (Development)
The backend default connection string connects to `agrilogix.db`:
```env
DATABASE_URL=sqlite:///./agrilogix.db
```

### PostgreSQL (Production / Docker)
To deploy with PostgreSQL:
```env
DATABASE_URL=postgresql+psycopg://agrilogix:<PASSWORD>@<HOST>:5432/agrilogix
```
Or start PostgreSQL locally via Docker Compose:
```bash
docker compose -f database/docker-compose.db.yml up -d
```
