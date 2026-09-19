from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from ocr_service import process_ocr

app = FastAPI(title="Scholarship AI Service")


class DocumentRequest(BaseModel):
    filePath: str
    documentType: Optional[str] = None
    applicationId: Optional[int] = None


@app.get("/health")
def health_check():
    return {"service": "scholarship-ai-service", "status": "ok"}


@app.post("/process-document")
def process_document(request: DocumentRequest):
    file_path = Path(request.filePath)
    if not file_path.is_file():
        raise HTTPException(status_code=404, detail=f"Document not found: {request.filePath}")

    try:
        ocr_result = process_ocr(str(file_path))
        return {
            "status": "completed",
            "documentType": request.documentType,
            "applicationId": request.applicationId,
            "ocr": ocr_result,
            "imageAnalysis": {"status": "detector_not_connected"},
            "recommendedAction": "manual_review"
        }
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error)) from error
