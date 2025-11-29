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

### Run with Docker Compose

```bash
docker-compose up --build
```

- Frontend: <http://localhost:3388>
- Backend API: <http://localhost:8888>
- Swagger UI: <http://localhost:8888/swagger-ui.html>
- PostgreSQL: localhost:54325

### Local Development

#### Backend

```bash
cd backend
mvn spring-boot:run
```

#### Frontend

```bash
cd frontend
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
