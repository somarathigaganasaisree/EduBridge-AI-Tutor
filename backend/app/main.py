import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.database import Base, engine

# ============================================================
# DATABASE MODELS
# ============================================================

from app.models.user import User
from app.models.user_profile import UserProfile

# Import the remaining models used by the application.
# Keep these imports so SQLAlchemy creates all required tables.
from app.models.grade import Grade
from app.models.subject import Subject
from app.models.unit import Unit
from app.models.module import Module
from app.models.learning_content import LearningContent
from app.models.quiz import Quiz
from app.models.unit_assessment import UnitAssessment


# ============================================================
# CREATE DATABASE TABLES
# ============================================================

Base.metadata.create_all(bind=engine)


# ============================================================
# DATABASE SCHEMA SYNC
# ============================================================

def _sync_database_schema():
    """
    Apply small schema changes required by the application
    without destroying existing data.
    """

    try:
        with engine.begin() as connection:

            # Add columns here only if your existing project
            # requires them.

            pass

    except Exception as error:
        print(
            f"Database schema sync warning: {error}"
        )


_sync_database_schema()


# ============================================================
# ROUTERS
# ============================================================

from app.auth.routes import router as auth_router
from app.grade_routes import router as grade_router
from app.student_routes import router as student_router
from app.subject_routes import router as subject_router
from app.unit_routes import router as unit_router
from app.module_routes import router as module_router
from app.learning_content_routes import router as learning_content_router
from app.quiz_routes import router as quiz_router
from app.unit_assessment_routes import router as unit_assessment_router
from app.progress_routes import router as progress_router
from app.performance_routes import router as performance_router
from app.profile_routes import router as profile_router
from app.assessment_routes import router as assessment_router

# AI Tutor / RAG router
from app.ai_tutor_routes import router as ai_tutor_router


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="EduBridge AI Tutor"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# UPLOADS
# ============================================================

UPLOAD_DIR = os.path.join(
    os.path.dirname(
        os.path.abspath(__file__)
    ),
    "..",
    "uploads",
)

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)

app.mount(
    "/uploads",
    StaticFiles(
        directory=UPLOAD_DIR
    ),
    name="uploads",
)


# ============================================================
# INCLUDE APPLICATION ROUTES
# ============================================================

app.include_router(auth_router)

app.include_router(grade_router)

app.include_router(student_router)

app.include_router(subject_router)

app.include_router(unit_router)

app.include_router(module_router)

app.include_router(
    learning_content_router
)

app.include_router(quiz_router)

app.include_router(
    unit_assessment_router
)

app.include_router(progress_router)

app.include_router(
    performance_router
)

app.include_router(profile_router)

app.include_router(
    assessment_router
)


# ============================================================
# AI TUTOR ROUTE
# ============================================================

app.include_router(
    ai_tutor_router
)


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "EduBridge API is running"
    }