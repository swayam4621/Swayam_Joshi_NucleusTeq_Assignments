# CircleUp

CircleUp is a backend API for organizing and joining group social activities. Users can create activities with a set capacity, browse and filter activities others have created, request to join, and activity owners can approve or reject join requests. Once approved, participants can see the organizer's contact number.

## Tech Stack

- **Framework:** FastAPI
- **ORM:** SQLAlchemy
- **Database:** PostgreSQL
- **Migrations:** Alembic
- **Validation:** Pydantic v2
- **Auth:** JWT (python-jose) + bcrypt password hashing (passlib)
- **Testing:** pytest, pytest-cov
- **Server:** Uvicorn

## Architecture

The backend follows a layered architecture to keep business logic testable and independent of the web framework:

```
Routes (app/api/routes/) → Services (app/services/) → Repositories (app/repositories/) → Models (app/models/)
```

- **Routes** — handle HTTP concerns only: parse requests, call the relevant service, translate custom exceptions into HTTP status codes.
- **Services** — contain all business logic and validation rules (ownership checks, capacity checks, status transitions). Raise custom Python exceptions on failure, with no knowledge of HTTP.
- **Repositories** — the only layer that talks to the database directly (SQLAlchemy queries).
- **Schemas** (`app/schemas/`) — Pydantic models validating request/response shapes at the API boundary.
- **Models** (`app/models/`) — SQLAlchemy ORM classes mapped to database tables.

This separation is what lets services be unit-tested directly (see `app/tests/test_*_service.py`) without spinning up the API or a test client.

## Project Structure

```
backend/
├── app/
│   ├── main.py                  # FastAPI app instantiation, CORS, router mounting
│   ├── core/
│   │   ├── config.py             # Settings loaded from .env (Pydantic BaseSettings)
│   │   ├── security.py           # Password hashing + JWT creation/decoding
│   │   ├── constants.py          # Shared constants (e.g. allowed cities)
│   │   ├── error_handlers.py     # Global unhandled-exception handler
│   │   └── logging_config.py
│   ├── db/
│   │   └── session.py            # SQLAlchemy engine, SessionLocal, get_db() dependency
│   ├── api/
│   │   ├── deps.py               # get_current_user / get_current_user_optional (JWT auth)
│   │   └── routes/                # auth.py, users.py, activities.py
│   ├── models/                    # SQLAlchemy ORM models (User, Activity, ActivityParticipation)
│   ├── schemas/                   # Pydantic request/response schemas
│   ├── services/                  # Business logic (auth, profile, activity, participation)
│   ├── repositories/               # Direct DB access functions
│   └── tests/                     # pytest suite (service-layer + API-layer tests)
├── alembic/                       # Database migrations
├── requirements.txt
├── pytest.ini
└── .env                           # Environment config (not committed)

frontend/
├── pages/index.html
├── css/
└── js/
    ├── api.js                     # Central fetch wrapper + typed API client
    ├── app.js                     # Entry point — wires up modules on page load
    └── modules/
        ├── auth.js                # Login / register / logout
        ├── activities.js          # Browse, create, edit activities
        ├── participation.js       # Join requests, approve/reject, "My Activities"
        ├── profile.js              # Profile view/update
        ├── navigation.js           # View switching (SPA-style, no router library)
        ├── state.js                # Shared in-memory app state
        └── dom-utils.js            # Shared UI helpers (modals, toasts, date formatting)
```

## Setup

### Prerequisites
- Python 3.13
- PostgreSQL running locally

### Installation

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

### Environment Variables

Create a `.env` file in `backend/`:

```
DATABASE_URL=postgresql://circleup_user:circleup_password@localhost:5432/circleup
JWT_SECRET_KEY=<your-secret-key>
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
ENVIRONMENT=development
TEST_DATABASE_URL=postgresql://circleup_user:circleup_password@localhost:5432/circleup_test
```

`TEST_DATABASE_URL` points to a separate database used only by the test suite (auto-created by `conftest.py` on first run) — this keeps tests fully isolated from development data.

### Database Migrations

```bash
alembic upgrade head
```

### Running the Server

```bash
uvicorn app.main:app --reload
```

API will be available at `http://localhost:8000`.

## API Documentation

FastAPI auto-generates interactive API docs from the route definitions and Pydantic schemas — no separate documentation to maintain:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Authentication

The API uses JWT bearer tokens.

1. `POST /auth/register` — create an account
2. `POST /auth/login` — returns an `access_token`
3. Include it on subsequent requests: `Authorization: Bearer <token>`

Tokens expire after `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` (default 60 minutes).

## Key Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Log in, receive a JWT |
| GET | `/auth/me` | Get the current logged-in user |
| GET / PATCH | `/users/me` | View / update profile |
| POST | `/activities` | Create an activity |
| GET | `/activities` | Browse activities (filterable by category, location, date range; sortable) |
| GET | `/activities/{id}` | Get activity detail |
| PATCH | `/activities/{id}` | Update an activity (owner only) |
| PATCH | `/activities/{id}/cancel` | Cancel an activity (owner only) |
| POST | `/activities/{id}/requests` | Request to join an activity |
| GET | `/activities/{id}/requests` | List join requests for an activity (owner only) |
| POST | `/activities/requests/{request_id}/approve` | Approve a join request (owner only) |
| POST | `/activities/requests/{request_id}/reject` | Reject a join request (owner only) |

## Notable Design Decisions

- **Lazy status computation** — an activity's status (e.g. flipping to `COMPLETED`) is computed on read by comparing its date to the current time, rather than via a background job.
- **Concurrency-safe approvals** — approving a join request uses a row-level lock (`SELECT ... FOR UPDATE`) to prevent two concurrent approvals from over-booking an activity past its `max_participants`.
- **Privacy-gated contact info** — an organizer's phone number is only ever included in API responses for the organizer themselves or for approved participants; this is enforced at the service/route layer, not just hidden client-side.

## Snapshots

### Landing Page
Browse activities without logging in — filter by category, city, and date range, sorted soonest-first by default.

<img width="1278" height="614" alt="image" src="https://github.com/user-attachments/assets/4a6172ab-6b74-4fea-85d0-caec2dbfa7f6" />

### Sign Up & Log In
Registration enforces password complexity (uppercase, lowercase, special character, 8+ chars) and a city selection from a fixed list, both validated live as you type and re-validated server-side.

<img width="401" height="652" alt="image" src="https://github.com/user-attachments/assets/b7cef922-d94a-41d4-aeda-d3977bcdd72f" />

<img width="488" height="471" alt="image" src="https://github.com/user-attachments/assets/e67e6c7d-2e3c-4692-a566-4c542ff8d240" />

### Activity Details — Context-Aware View
The same activity detail modal renders differently depending on who's viewing: a logged-out visitor is prompted to log in, the organizer sees an ownership message, and a logged-in visitor gets a "Request to Join" control with a participant-count stepper.

| Logged out | As organizer | Requesting to join |
|---|---|---|
| <img width="443" height="378" alt="image" src="https://github.com/user-attachments/assets/bd564cea-0662-49f6-8c34-76efbea7a11f" />| <img width="515" height="453" alt="image" src="https://github.com/user-attachments/assets/02b07b73-e014-4bf6-8b1a-838d2caeb13d" /> | <img width="455" height="495" alt="image" src="https://github.com/user-attachments/assets/d4a08c67-3534-4aa0-a0a3-8ded05d12e1c" />|

### Create Activity
Organizers set title, category, location, date/time, and capacity — all validated both client-side (instant feedback) and server-side (Pydantic, the actual source of truth).

<img width="1034" height="664" alt="image" src="https://github.com/user-attachments/assets/d017845e-c253-4a72-a774-4951d18d0348" />

### My Activities Dashboard
A tabbed view across everything a user is involved in: activities they've created, activities they've joined, requests still pending, and requests that were rejected.

<img width="961" height="580" alt="image" src="https://github.com/user-attachments/assets/ca21d487-e47a-4c11-8b5b-6a332b78f53d" />

### Manage Requests
Organizers approve or reject pending join requests from this modal. Once approved, a participant's phone number becomes visible here — and only here, and only to the organizer and that participant, per the contact-visibility rule.

<img width="471" height="668" alt="image" src="https://github.com/user-attachments/assets/c0297483-9a19-4ab2-9272-4da614af42c9" />

### My Activities — All Tabs
<img width="728" height="308" alt="image" src="https://github.com/user-attachments/assets/bbf2bc79-288b-4891-af2f-45be137fbaca" />

<img width="733" height="308" alt="image" src="https://github.com/user-attachments/assets/1c72ae99-341a-4b7e-a76a-76adbb123a18" />

<img width="698" height="297" alt="image" src="https://github.com/user-attachments/assets/39531936-3f25-46fa-b400-4dd599b08219" />


### Profile
Users can update their name, phone number, city, and bio at any time.

<img width="1039" height="709" alt="image" src="https://github.com/user-attachments/assets/9b1a1e3a-915b-4b75-863f-5dcd9d6ae53f" />


## Testing

```bash
cd backend
pytest --cov=app --cov-report=html
```

This generates a coverage report at `htmlcov/index.html`. Tests are split into:
- **Service-layer tests** (`test_auth_service.py`, `test_activity_service.py`, `test_participation_service.py`) — test business logic directly, bypassing HTTP entirely.
- **API-layer tests** (`test_api_auth.py`) — test routes end-to-end using FastAPI's `TestClient`.

Tests run against `TEST_DATABASE_URL`, never the development database, and the schema is cleaned between every test.
