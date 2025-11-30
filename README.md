# Waterball Course Platform

收費課程網站 - MVP 版本

## Tech Stack

### Frontend

- Next.js 15
- TypeScript
- Tailwind CSS + shadcn/ui

### Backend

- Java 17+
- Spring Boot 3.x
- PostgreSQL 15+
- Flyway (Database Migration)
- 3-Layer Architecture

### Infrastructure

- Docker & Docker Compose
- Supabase Storage

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Java 17+ (for local development)
- Google OAuth Client ID (for authentication)

### 1. Environment Setup

#### Backend (.env)

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and configure:

```env
# Database (use these defaults for Docker Compose)
SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/course_platform
SPRING_DATASOURCE_USERNAME=waterball
SPRING_DATASOURCE_PASSWORD=waterball123

# Google OAuth - REQUIRED
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# JWT Configuration
JWT_SECRET=your-256-bit-secret-key-change-this-in-production
JWT_ACCESS_EXPIRATION=1800000
JWT_REFRESH_EXPIRATION=2592000000

# Cookie Configuration
COOKIE_DOMAIN=localhost
COOKIE_SECURE=false

# Supabase (optional, for file storage)
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
```

#### Frontend (.env)

```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8888
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

> **Note:** `GOOGLE_CLIENT_ID` must be the same in both backend and frontend.

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to APIs & Services → Credentials
4. Create OAuth 2.0 Client ID (Web application)
5. Add authorized JavaScript origins: `http://localhost:3388`
6. Add authorized redirect URIs: `http://localhost:3388`
7. Copy the Client ID to both `.env` files

### 2. Run with Docker Compose

```bash
docker-compose up -d --build
```

- Frontend: <http://localhost:3388>
- Backend API: <http://localhost:8888>
- Swagger UI: <http://localhost:8888/swagger-ui.html>
- PostgreSQL: localhost:54325

### 3. Mock Data

The database is automatically seeded with mock data via Flyway migrations:

- Sample journeys, chapters, and lessons
- Different access levels (PUBLIC, TRIAL, PURCHASED)
- Test users and purchases

### Local Development

#### Backend

```bash
cd backend
cp .env.example .env  # Edit with your config
mvn spring-boot:run
```

> For local dev, use `SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:54325/course_platform`

#### Frontend

```bash
cd frontend
cp .env.example .env  # Edit with your config
npm install
npm run dev
```

## Project Structure

```
project/
├── frontend/           # Next.js 15 application
├── backend/            # Spring Boot application
├── docs/               # Documentation
├── specs/              # Specification documents
├── docker-compose.yml
└── README.md
```

## Documentation

- [Architecture](docs/architecture.md)
- [Development Guide](docs/development-guide.md)
- [Deployment Guide](docs/deployment-guide.md)

## License

MIT
