# E-commerce API — Project Overview

English documentation for this NestJS backend: what it contains, how to run it locally, with Docker, and how to manage database migrations and seeds.

## Stack

| Layer | Technology |
|--------|------------|
| Framework | [NestJS](https://nestjs.com/) (TypeScript) |
| Database | MySQL 8 (via [TypeORM](https://typeorm.io/)) |
| Cache / sessions (config) | Redis 7 (configuration present; `RedisModule` is currently commented out in `AppModule`) |
| Auth | JWT ([Passport](https://passportjs.org/) + `@nestjs/jwt`) |
| Validation | `class-validator` / `class-transformer` |
| API docs | Swagger UI at `/api/docs` |
| HTTP hardening | Helmet, global validation pipe, HTTP exception filter |
| File / cloud (config) | AWS S3 settings via `@nestjs/config` (`aws.config`) |

Other dependencies in `package.json` (e.g. mailer, RabbitMQ, SQS clients) are available for features that may be extended; the modules registered in `AppModule` are listed below.

## What the project includes

### Feature modules (`src/modules/`)

- **Auth** — Authentication (JWT-based).
- **Users** — User accounts.
- **Categories** — Product categories.
- **Products** — Catalog items.
- **Carts** — Shopping carts.
- **Orders** — Orders.
- **Reviews** — Product reviews.
- **RBAC** — Roles and permissions.
- **Forgot password** — Password reset flow (includes DB support via migrations).

### Shared code (`src/common/`)

Constants, decorators, entities, exceptions, filters, interceptors (including a global response interceptor), upload helpers, utilities, and optional Redis wiring.

### Database

- **Migrations** — `src/database/migrations/` (TypeORM; schema is not auto-synced in production: `synchronize: false`).
- **Seeds** — `src/database/seeds/`: runner `seeds.ts` executes every `*.seed.ts` file in sorted order (e.g. `1-roles.seed.ts`).

---

## Prerequisites

- **Node.js** (project uses Node 22 in Docker; a recent LTS is recommended locally).
- **npm** (see `package-lock.json`).
- **MySQL** and optionally **Redis** if you run services yourself instead of Docker.

---

## Environment variables

Copy the example file and adjust values:

```bash
cp .env.example .env
```

Typical variables (see `.env.example` for the full list):

- **App:** `PORT` (default `3000`).
- **Database:** `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`.
- **Redis:** `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_DB`.
- **JWT:** `JWT_SECRET`, `JWT_EXPIRES` (optional: `JWT_REFRESH_EXPIRES`).
- **AWS S3:** `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_S3_URL`.

With **Docker Compose**, the `app` service overrides `DB_HOST` → `mysql` and `REDIS_HOST` → `redis` so the API container talks to the compose network. Your `.env` should still define credentials and database name consistently with the `mysql` service (e.g. `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`).

---

## Install dependencies

```bash
npm install
```

---

## Run the application (local)

Ensure MySQL is running and matches `.env`, then:

| Command | Description |
|---------|-------------|
| `npm run start` | Single run |
| `npm run start:dev` | Development with watch |
| `npm run start:debug` | Debug + watch |
| `npm run start:prod` | Production (`node dist/main` after build) |
| `npm run build` | Compile to `dist/` |

**Swagger UI:** after the app starts, open `http://localhost:<PORT>/api/docs` (default port `3000`).

---

## Docker

### Build and start (app + MySQL + Redis)

From the project root (with a valid `.env`):

```bash
docker compose up -d --build
```

- **App:** `http://localhost:${PORT:-3000}` (host port from `PORT` in `.env` or default `3000`).
- **MySQL:** host port `${DB_PORT:-3306}` (see `docker-compose.yml`).
- **Redis:** host port `${REDIS_PORT:-6379}`.

Stop and remove containers:

```bash
docker compose down
```

Data volumes (`mysql_data`, `redis_data`) persist unless you remove them explicitly.

### Run migrations or seeds against Docker MySQL

Either:

1. Run scripts **on the host** with `DB_HOST=127.0.0.1` and `DB_PORT` matching the published MySQL port, or  
2. `docker compose exec app sh` (if the image includes dev tools) and run the same npm scripts **inside** the container — note the production Dockerfile only installs production dependencies, so migration/seed CLI is usually run from the host with `DB_HOST=localhost` and the mapped port.

Adjust host/port in `.env` so they match how you connect (Docker Desktop on Windows typically uses `localhost` and the mapped `3306`).

---

## Database migrations (TypeORM)

Configuration file: `src/database/data-source.ts`.

| Command | Description |
|---------|-------------|
| `npm run migration:run` | Apply pending migrations |
| `npm run migration:revert` | Revert the last migration |
| `npm run migration:create --name=YourMigrationName` | Create a new migration file under `src/database/migrations/` |

On **Windows** (cmd/PowerShell), the script uses `%npm_config_name%` as in `package.json`. On **Unix-like** systems, if the create command fails, use the equivalent TypeORM CLI invocation with your migration path, or align the script with `$npm_config_name`.

Run migrations **after** the database exists and **before** or when deploying the app (Compose does not run them automatically).

---

## Database seeds

| Command | Description |
|---------|-------------|
| `npm run seed` | Runs all `*.seed.ts` files in `src/database/seeds/` in filename order |
| `npm run seed:file --name=1-roles.seed.ts` | Run a single seed file (name is the filename under `src/database/seeds/`) |

Seeds require a working DB connection (same env as migrations). Run after migrations if seeds depend on tables.

---

## Tests and quality

| Command | Description |
|---------|-------------|
| `npm run test` | Unit tests (`*.spec.ts`) |
| `npm run test:watch` | Watch mode |
| `npm run test:cov` | Coverage |
| `npm run test:e2e` | E2E tests (`test/jest-e2e.json`) |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

---

## Related files

- `PROJECT_STRUCTURE.md` — Folder layout reference.
- `Dockerfile` — Multi-stage build: `node:22-alpine`, `npm ci`, `npm run build`, production `node dist/main`.
- `docker-compose.yml` — Services: `app`, `mysql`, `redis`.

---

## Summary workflow (first-time local setup)

1. `cp .env.example .env` and set secrets and DB name.  
2. Start MySQL (and Redis if needed) or `docker compose up -d mysql redis` (or full stack).  
3. `npm install`  
4. `npm run migration:run`  
5. `npm run seed` (optional)  
6. `npm run start:dev`  
7. Open `http://localhost:3000/api/docs` (or your `PORT`).
