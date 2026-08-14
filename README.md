# AWS Route 53 Clone

A full-stack technical assessment project that replicates core **Amazon Route 53 Hosted Zones** and **DNS record management** workflows. The application provides a browser-based console styled after the AWS Route 53 UI, backed by a REST API with session-based authentication and per-user data isolation.

This is a **mock implementation** focused on hosted zone and DNS record CRUD—not a production DNS service. It does not integrate with real nameservers or AWS APIs.

---

## Table of contents

1. [Project overview](#project-overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Technology stack](#technology-stack)
5. [Project structure](#project-structure)
6. [Database schema](#database-schema)
7. [API overview](#api-overview)
8. [Authentication flow](#authentication-flow)
9. [Local setup](#local-setup)
10. [Environment variables](#environment-variables)
11. [Running the frontend](#running-the-frontend)
12. [Running the backend](#running-the-backend)
13. [API documentation](#api-documentation)
14. [Screenshots](#screenshots)
15. [Deployment](#deployment)
16. [Design decisions](#design-decisions)
17. [Limitations](#limitations)
18. [Future improvements](#future-improvements)

---

## Project overview

The Route 53 Clone demonstrates end-to-end full-stack development:

- **Frontend:** Next.js 14 (App Router) with TypeScript and Tailwind CSS, presenting an AWS-inspired console for managing DNS resources.
- **Backend:** FastAPI with SQLAlchemy ORM, exposing a versioned REST API under `/api`.
- **Database:** SQLite for local persistence with relational models for users, sessions, hosted zones, and DNS records.

Authenticated users can create hosted zones, manage DNS records within those zones, search and paginate lists, and perform create/read/update/delete operations scoped strictly to their own account.

---

## Features

### Authentication

- Email and password login against the backend API
- Bearer token sessions stored server-side as SHA-256 hashes
- Session validation via `GET /api/auth/me`
- Logout revokes the current session token only
- Login rate limiting (10 attempts per email per 60 seconds)
- Session persistence across browser restarts (token in `localStorage`)
- Expired or invalid sessions redirect to the login page with an optional expiry banner

### Hosted zones

- List hosted zones with pagination (8 items per page in the UI)
- Search zones by name or description (debounced, 300 ms)
- Create hosted zones (full-page form) with public or private zone type
- View zone details and record count
- Edit zone name and description (modal on the list page)
- Delete hosted zones (modal confirmation from list or zone detail; cascades to DNS records)
- Duplicate zone names per user rejected with HTTP 409

### DNS records

- List records within a hosted zone with pagination (8 items per page in the UI)
- Search records by name or value
- Filter records by type (A, AAAA, CNAME, TXT, MX, NS, PTR, SRV, CAA)
- Create records (full-page form) with type-specific fields
- Edit records (modal; record type locked in edit mode)
- Delete records (modal confirmation)
- Server-side validation per record type (e.g. IPv4 for A, IPv6 for AAAA, MX priority)

### User interface

- AWS-inspired layout: dark header, light sidebar, Route 53 styling
- Breadcrumbs, tables, modals, form validation, and toast notifications
- Loading, error (with retry), and empty states
- Responsive layout with collapsible sidebar below the `lg` breakpoint
- Protected routes via Next.js middleware and client-side `AuthGuard`

### Security and data isolation

- All hosted zone and DNS record operations require authentication
- Resources owned by other users return HTTP 404 (not 403) to avoid enumeration
- Passwords hashed with PBKDF2-HMAC-SHA256 (200,000 iterations)
- CORS restricted to configured frontend origins

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Next.js)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │  Middleware  │  │  AuthGuard   │  │  Pages & Components    │ │
│  │ (route gate) │  │ (/auth/me)   │  │  hooks → API client    │ │
│  └──────────────┘  └──────────────┘  └───────────┬────────────┘ │
└──────────────────────────────────────────────────│──────────────┘
                                                   │ HTTPS/HTTP
                                                   │ Authorization: Bearer
                                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FastAPI (port 8000)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ Auth router  │  │ Zone router  │  │  DNS record router     │ │
│  └──────┬───────┘  └──────┬───────┘  └───────────┬────────────┘ │
│         │                 │                       │              │
│         └─────────────────┼───────────────────────┘              │
│                           ▼                                      │
│              ┌────────────────────────┐                          │
│              │  Service layer         │                          │
│              │  (user-scoped queries) │                          │
│              └────────────┬───────────┘                          │
└───────────────────────────│──────────────────────────────────────┘
                            ▼
                   ┌─────────────────┐
                   │  SQLite (app.db) │
                   └─────────────────┘
```

**Request flow (authenticated API call):**

1. Frontend reads the access token from `localStorage` and sends `Authorization: Bearer <token>`.
2. FastAPI dependency resolves the token hash, loads the session, checks expiry, and loads the user.
3. Service layer filters all queries by `user_id`.
4. Pydantic schemas validate request and response payloads.

---

## Technology stack

| Layer | Technology |
|-------|------------|
| Frontend framework | Next.js 14 (App Router) |
| Frontend language | TypeScript 5.5 |
| Styling | Tailwind CSS 3.4 |
| Backend framework | FastAPI 0.115 |
| ORM | SQLAlchemy 2.0 |
| Database | SQLite |
| Validation | Pydantic 2.x |
| HTTP server | Uvicorn |
| Testing | pytest, httpx (backend) |

---

## Project structure

```
AWS_Route53_clone/
├── backend/
│   ├── app/
│   │   ├── core/              # Password hashing, session tokens, rate limiting
│   │   ├── dependencies/      # FastAPI auth dependencies
│   │   ├── models/            # SQLAlchemy models
│   │   ├── routers/           # API route handlers
│   │   ├── schemas/           # Pydantic request/response models
│   │   ├── services/          # Business logic (user-scoped)
│   │   ├── utils/             # DNS validation, pagination
│   │   ├── config.py          # Settings from environment
│   │   ├── database.py        # Engine, session, init_db
│   │   ├── exceptions.py      # Domain exceptions
│   │   ├── main.py            # FastAPI app entry point
│   │   └── seed.py            # Optional demo user seeding
│   ├── tests/
│   │   └── test_api.py        # API integration tests
│   ├── .env.example
│   ├── requirements.txt
│   └── pytest.ini
│
└── frontend/
    ├── app/
    │   ├── (app)/               # Protected routes (shared layout)
    │   │   ├── dashboard/
    │   │   ├── hosted-zones/
    │   │   │   ├── create/
    │   │   │   └── [id]/
    │   │   │       └── records/create/
    │   │   └── layout.tsx       # AuthGuard + AppShell
    │   ├── login/
    │   ├── layout.tsx
    │   ├── page.tsx             # Redirects to /dashboard
    │   └── globals.css
    ├── components/              # UI, layout, hosted-zone forms
    ├── contexts/                # AuthContext
    ├── hooks/                   # Data fetching, pagination, toasts
    ├── lib/                     # API client, validation, utilities
    ├── types/                   # TypeScript interfaces
    ├── middleware.ts            # Route protection cookie check
    ├── .env.local.example
    └── package.json
```

---

## Database schema

SQLite database file: `backend/app.db` (created on first backend startup, path configurable via `DATABASE_URL`).

```
users
├── id              INTEGER PRIMARY KEY
├── email           VARCHAR(255) UNIQUE NOT NULL
├── password_hash   VARCHAR(255) NOT NULL
└── created_at      DATETIME NOT NULL

sessions
├── id              INTEGER PRIMARY KEY
├── user_id         INTEGER FK → users.id (ON DELETE CASCADE)
├── token_hash      VARCHAR(64) UNIQUE NOT NULL
├── expires_at      DATETIME NOT NULL
└── created_at      DATETIME NOT NULL

hosted_zones
├── id              INTEGER PRIMARY KEY
├── user_id         INTEGER FK → users.id (ON DELETE CASCADE)
├── name            VARCHAR(255) NOT NULL
├── zone_type       VARCHAR(20) NOT NULL  ('public' | 'private')
├── description     TEXT
├── created_at      DATETIME NOT NULL
└── updated_at      DATETIME NOT NULL
    UNIQUE (user_id, name)

dns_records
├── id              INTEGER PRIMARY KEY
├── hosted_zone_id  INTEGER FK → hosted_zones.id (ON DELETE CASCADE)
├── name            VARCHAR(255) NOT NULL
├── type            VARCHAR(20) NOT NULL
├── value           TEXT NOT NULL
├── ttl             INTEGER NOT NULL (default 300)
├── priority        INTEGER
├── weight          INTEGER
├── port            INTEGER
├── target          VARCHAR(255)
├── flag            INTEGER
├── tag             VARCHAR(50)
├── created_at      DATETIME NOT NULL
└── updated_at      DATETIME NOT NULL
```

**Relationships:**

- One user → many sessions, many hosted zones
- One hosted zone → many DNS records
- Deleting a user cascades sessions and zones; deleting a zone cascades its records

---

## API overview

Base URL: `http://localhost:8000/api` (configurable)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/health` | No | Health check (root app, not under `/api`) |
| `POST` | `/auth/login` | No | Login; returns access token and user |
| `GET` | `/auth/me` | Bearer | Current user profile |
| `POST` | `/auth/logout` | Bearer | Revoke current session |
| `GET` | `/hosted-zones` | Bearer | List zones (`page`, `limit`, `search`) |
| `POST` | `/hosted-zones` | Bearer | Create zone |
| `GET` | `/hosted-zones/{id}` | Bearer | Get zone by ID |
| `PUT` | `/hosted-zones/{id}` | Bearer | Update zone |
| `DELETE` | `/hosted-zones/{id}` | Bearer | Delete zone (204) |
| `GET` | `/hosted-zones/{id}/records` | Bearer | List records (`page`, `limit`, `search`, `type`) |
| `POST` | `/hosted-zones/{id}/records` | Bearer | Create record |
| `GET` | `/hosted-zones/{id}/records/{record_id}` | Bearer | Get record |
| `PUT` | `/hosted-zones/{id}/records/{record_id}` | Bearer | Update record |
| `DELETE` | `/hosted-zones/{id}/records/{record_id}` | Bearer | Delete record (204) |

**Common HTTP status codes:**

| Code | Meaning |
|------|---------|
| 400 | Validation error |
| 401 | Missing or invalid authentication |
| 404 | Resource not found (includes cross-user access) |
| 409 | Duplicate hosted zone name |
| 429 | Login rate limit exceeded |

---

## Authentication flow

```
┌──────────┐    POST /auth/login     ┌──────────┐
│  Login   │ ──────────────────────► │  FastAPI │
│  page    │ ◄────────────────────── │          │
└────┬─────┘   access_token + user   └────┬─────┘
     │                                     │
     │  Store token in localStorage        │  Store SHA-256(token) in sessions
     │  Set route53_auth=1 cookie         │
     ▼                                     │
┌──────────┐    GET /auth/me + Bearer     │
│ Protected│ ───────────────────────────►│
│  pages   │ ◄───────────────────────────│
└──────────┘   user profile              │
     │
     │  POST /auth/logout
     ▼
 Clear localStorage + cookie; delete session row
```

**Layers of protection:**

1. **Next.js middleware** — redirects unauthenticated users to `/login` if the `route53_auth` cookie is absent.
2. **AuthGuard** — client component calls `GET /api/auth/me` on mount; redirects to login if the token is invalid.
3. **API** — every protected endpoint validates the bearer token against the `sessions` table.

> **Note:** The middleware cookie is a route-gating hint only. API authorization always depends on the bearer token.

---

## Local setup

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11 or 3.12 (recommended; 3.14 may fail to build some dependencies)
- Git

### Clone the repository

```bash
git clone <repository-url>
cd AWS_Route53_clone
```

### Backend setup

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
```

### Frontend setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
```

---

## Environment variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_NAME` | `Route53 Clone API` | Application title |
| `API_V1_PREFIX` | `/api` | API route prefix |
| `DATABASE_URL` | `sqlite:///./app.db` | SQLAlchemy database URL |
| `ALLOW_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000` | Comma-separated CORS origins |
| `SEED_DEFAULT_USER` | `false` | When `true`, creates demo user on startup |

**Demo user** (only when `SEED_DEFAULT_USER=true`):

- Email: `admin@example.com`
- Password: `password123`

### Frontend (`frontend/.env.local`)

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000/api` | Backend API base URL |

---

## Running the frontend

From the `frontend/` directory:

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000). Unauthenticated users are redirected to `/login`.

---

## Running the backend

From the `backend/` directory (with the virtual environment activated):

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Verify the server is running:

```bash
curl http://localhost:8000/health
# {"status":"ok"}
```

### Running tests

```bash
cd backend
pytest
```

Tests use an in-memory SQLite database and do not require a running server.

---

## API documentation

When the backend is running, FastAPI provides interactive documentation:

| URL | Description |
|-----|-------------|
| [http://localhost:8000/docs](http://localhost:8000/docs) | Swagger UI |
| [http://localhost:8000/redoc](http://localhost:8000/redoc) | ReDoc |
| [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json) | OpenAPI schema |

Use the **Authorize** button in Swagger UI and enter `Bearer <your_access_token>` to test protected endpoints.

---

## Screenshots

Add screenshots to a `docs/screenshots/` directory and reference them here for reviewers.

| Screenshot | Description |
|------------|-------------|
| `docs/screenshots/login.png` | Login page |
| `docs/screenshots/hosted-zones.png` | Hosted zones list |
| `docs/screenshots/zone-detail.png` | Zone detail with DNS records |
| `docs/screenshots/create-record.png` | Create DNS record form |

**Suggested capture flow:**

1. Log in with the demo credentials (with `SEED_DEFAULT_USER=true`).
2. Create a hosted zone (e.g. `example.com`).
3. Add A, MX, and TXT records.
4. Capture list, detail, and form views at desktop width (~1280 px).

---

## Deployment

This project ships without Docker or CI/CD configuration. For a simple deployment:

### Backend

1. Set environment variables on the host (use a production `DATABASE_URL`; PostgreSQL is compatible with SQLAlchemy if you change the driver).
2. Set `SEED_DEFAULT_USER=false` in production.
3. Set `ALLOW_ORIGINS` to your frontend URL.
4. Run with a production ASGI server:

   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

### Frontend

1. Set `NEXT_PUBLIC_API_BASE_URL` to the deployed backend URL at **build time**.
2. Build and start:

   ```bash
   npm run build
   npm start
   ```

3. Serve over HTTPS in production so tokens are not sent in cleartext.

> **Note:** Session tokens are stored in `localStorage` on the client. For production hardening, consider moving to `HttpOnly` cookies and disabling OpenAPI docs on public deployments.

---

## Design decisions

| Decision | Rationale |
|----------|-----------|
| **SQLite for local development** | Zero-config persistence suitable for a technical assessment; SQLAlchemy allows swapping to PostgreSQL later. |
| **Bearer tokens with hashed session storage** | Simple stateful auth without JWT complexity; raw tokens never stored in the database. |
| **404 for cross-user resource access** | Prevents attackers from distinguishing “exists but forbidden” from “not found.” |
| **Service layer with user-scoped queries** | Keeps authorization logic out of route handlers and centralizes data access. |
| **Pydantic + custom DNS validation** | Schema validation at the API boundary; type-specific record rules in a dedicated module. |
| **Next.js App Router with route groups** | `(app)/` layout wraps all protected pages with a single `AuthGuard` and shell. |
| **AWS-inspired UI tokens** | Tailwind custom colors and Source Sans 3 approximate the Route 53 console for evaluator familiarity. |
| **Pagination at 8 items in the UI** | Matches a compact console table; backend supports up to 100 items per page. |
| **Modals for edit/delete, full pages for create** | Mirrors common AWS console patterns where creation is a wizard/page and edits are inline or modal. |
| **Optional demo user seeding** | Gated by `SEED_DEFAULT_USER` so production deployments do not get default credentials by accident. |

---

## Limitations

The following are **intentionally out of scope** or **not implemented**:

- **No user registration** — users are seeded or inserted directly; login only.
- **No real DNS propagation** — records are stored in SQLite only; no BIND/nameserver integration.
- **Dashboard statistics are placeholders** — hosted zone count shows `—`; most dashboard actions link to `#`.
- **Bulk operations disabled** — toolbar buttons (View details, Edit, Delete) on the hosted zones list are not wired.
- **Private zones are cosmetic** — zone type can be set to `private`, but there is no VPC association flow.
- **Sidebar navigation mostly static** — only Dashboard and Hosted zones routes are functional; other items use `href="#"`.
- **DNSSEC and Hosted zone tags tabs** — rendered on the zone detail page but not functional.
- **Routing policies** — always displayed as “Simple routing”; no weighted, latency, or failover policies.
- **Tags on hosted zones** — UI present but disabled on the create form.
- **No database migrations** — schema is created via SQLAlchemy `create_all()` on startup; Alembic is not configured.
- **In-memory login rate limit** — resets on server restart; not shared across multiple worker processes.
- **No import/export** — zone file (BIND/JSON) import and export are not implemented.

---

## Future improvements

Potential enhancements beyond the current assessment scope:

- **Zone file export** (JSON and BIND) from the zone detail page
- **Bulk delete** for DNS records and hosted zones with row selection
- **User registration and password reset**
- **Live dashboard metrics** wired to the hosted zones API
- **Database migrations** with Alembic
- **HttpOnly cookie sessions** instead of `localStorage` tokens
- **PostgreSQL** for production deployments
- **Docker Compose** for one-command local startup
- **End-to-end tests** with Playwright or Cypress

---

## License

This project was created as a technical assessment submission. Add license terms here if applicable.
