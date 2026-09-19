from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from ocr_service import process_ocr

app = FastAPI(title="Scholarship AI Service")

class DocumentRequest(BaseModel):
    filePath: str
    documentType: str | None = None
    applicationId: int | None = None

@app.get("/health")
def health_check():
    return {
        "service": "scholarship-ai-service",
        "status": "ok"
    }

@app.post("/process-document")
def process_document(request: DocumentRequest):
    try:
        ocr_result = process_ocr(request.filePath)

        return {
            "status": "completed",
            "documentType": request.documentType,
            "applicationId": request.applicationId,
            "ocr": ocr_result,
            "imageAnalysis": {
                "status": "detector_not_connected"
            },
            "recommendedAction": "manual_review"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))