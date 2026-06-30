from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, users, activities
from app.core.error_handlers import unhandled_exception_handler
from app.core.logging_config import configure_logging

configure_logging()

app = FastAPI(
    title="CircleUp API",
    description="API for discovering and organizing social activities.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(Exception, unhandled_exception_handler)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(activities.router)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}