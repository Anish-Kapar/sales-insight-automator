from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request, Depends
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from services.parser import parse_file
from services.ai_engine import generate_summary
from services.mailer import send_email
from middleware.validation import validate_api_key
import logging

logger = logging.getLogger(__name__)
limiter = Limiter(key_func=get_remote_address)
router = APIRouter()

ALLOWED_CONTENT_TYPES = [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/octet-stream",
]
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post(
    "/upload",
    summary="Upload Sales Data & Send AI Summary",
    description="Upload a .csv or .xlsx sales file and a recipient email. The API parses the file, generates an AI-powered narrative summary, and emails it to the recipient.",
    response_description="Confirmation that the summary was generated and sent.",
)
@limiter.limit("10/minute")
async def upload_and_analyze(
    request: Request,
    file: UploadFile = File(..., description="Sales data file (.csv or .xlsx, max 5MB)"),
    email: str = Form(..., description="Recipient email address"),
    _: None = Depends(validate_api_key),
):
    # --- File type validation ---
    filename = file.filename or ""
    if not (filename.endswith(".csv") or filename.endswith(".xlsx")):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only .csv and .xlsx files are accepted.",
        )

    # --- File size validation ---
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File too large. Maximum allowed size is 5MB.",
        )

    # --- Email basic validation ---
    if "@" not in email or "." not in email.split("@")[-1]:
        raise HTTPException(status_code=400, detail="Invalid email address provided.")

    logger.info(f"Processing file: {filename} for email: {email}")

    # --- Parse file ---
    try:
        data_text = parse_file(contents, filename)
    except Exception as e:
        logger.error(f"Parsing failed: {e}")
        raise HTTPException(status_code=422, detail=f"Failed to parse file: {str(e)}")

    # --- AI Summary ---
    try:
        summary = await generate_summary(data_text)
    except Exception as e:
        logger.error(f"AI generation failed: {e}")
        raise HTTPException(status_code=502, detail=f"AI engine error: {str(e)}")

    # --- Send Email ---
    try:
        await send_email(email, summary, filename)
    except Exception as e:
        logger.error(f"Email sending failed: {e}")
        raise HTTPException(status_code=502, detail=f"Mail delivery error: {str(e)}")

    return JSONResponse(
        status_code=200,
        content={
            "status": "success",
            "message": f"AI summary generated and sent to {email}.",
            "file": filename,
        },
    )
