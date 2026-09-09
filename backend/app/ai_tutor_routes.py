from pathlib import Path
import sys

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

# Project paths
BACKEND_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BACKEND_DIR.parent
RAG_DIR = PROJECT_ROOT / "Rag"

# Allow Python to import the RAG package
if str(RAG_DIR) not in sys.path:
    sys.path.insert(0, str(RAG_DIR))

from rag_pipeline.pipeline import RAGPipeline


router = APIRouter()

# Load the RAG pipeline once
rag_pipeline = RAGPipeline()


class AskRequest(BaseModel):
    question: str
    class_name: str = ""
    subject: str = ""


@router.post("/ask")
def ask_question(request: AskRequest):
    try:
        answer = rag_pipeline.answer(
            request.question,
            class_name=request.class_name,
            subject=request.subject,
        )

        return {
            "answer": answer,
            "intent": "new_question",
        }

    except Exception as e:
        print(f"AI Tutor Error: {e}")

        raise HTTPException(
            status_code=500,
            detail=f"AI Tutor service error: {str(e)}",
        )