from datetime import datetime, timedelta, timezone

import pytest
import psycopg2
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.core.security import hash_password
from app.db.session import Base
from app.models.activity import Activity, ActivityStatus
from app.models.user import User


def _ensure_test_database():
    admin_url = settings.TEST_DATABASE_URL.rsplit("/", 1)[0] + "/postgres"
    conn = psycopg2.connect(admin_url)
    conn.autocommit = True
    with conn.cursor() as cur:
        cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", ("circleup_test",))
        exists = cur.fetchone()
        if not exists:
            cur.execute("CREATE DATABASE circleup_test")
    conn.close()


@pytest.fixture(scope="session")
def engine():
    _ensure_test_database()
    engine = create_engine(settings.TEST_DATABASE_URL, pool_pre_ping=True)
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture(scope="function")
def db_session(engine):
    SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)
    session = SessionLocal()
    yield session

    session.rollback()
    for table in reversed(Base.metadata.sorted_tables):
        session.execute(table.delete())
    session.commit()
    session.close()


@pytest.fixture
def make_user(db_session):
    def _make_user(**overrides):
        defaults = {
            "name": "Test User",
            "email": "testuser@gmail.com",
            "hashed_password": hash_password("StrongPass123!"),
            "phone_number": "1234567890",
            "city": "Mumbai",
            "bio": "A test user",
        }
        defaults.update(overrides)
        user = User(**defaults)
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        return user

    return _make_user


@pytest.fixture
def make_activity(db_session):
    def _make_activity(creator, **overrides):
        defaults = {
            "creator_id": creator.id,
            "title": "Sample Activity",
            "description": "A test activity",
            "category": "Social",
            "location": "Mumbai",
            "date": datetime.now(timezone.utc) + timedelta(hours=1),
            "max_participants": 2,
            "status": ActivityStatus.OPEN,
        }
        defaults.update(overrides)
        activity = Activity(**defaults)
        db_session.add(activity)
        db_session.commit()
        db_session.refresh(activity)
        return activity

    return _make_activity
