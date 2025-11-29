# AGENTS.md

## Build & Test Commands

- **Frontend (from /frontend):** `npm run dev` (dev), `npm run build` (build), `npm run lint` (lint)
- **Backend (from /backend):** `mvnw spring-boot:run` (dev), `mvnw clean package` (build), `mvnw test` (all tests)
- **Single backend test:** `mvnw test -Dtest=HealthCheckControllerTest`
- **Docker:** `docker-compose up` from project root

## Code Style

- **Frontend:** TypeScript strict mode, Next.js 16 with App Router, Tailwind CSS, shadcn/ui components
- **Backend:** Java 17, Spring Boot 3.2, Lombok, JPA, Flyway migrations
- **Imports:** Use `@/*` path alias for frontend; group Java imports (java.*, external, project)
- **Naming:** React components PascalCase, Java classes PascalCase, camelCase for methods/variables
- **Types:** Define interfaces in `/types`, use explicit return types for services
- **Components:** Functional components only, use `cn()` for className merging
- **Error handling:** Backend uses `GlobalExceptionHandler`, frontend services return typed responses
- **Tests:** Backend uses Testcontainers + JUnit 5, extend `BaseIntegrationTest` for integration tests
- **Security:** Never commit secrets; use `.env` files (see `.env.example`)
