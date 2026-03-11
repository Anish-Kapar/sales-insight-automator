from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from routes import upload
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Sales Insight Automator API",
    description="Upload sales CSV/Excel files and receive AI-generated summaries via email.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Lock down in production to your frontend URL
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api", tags=["Upload & Analyze"])

@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "message": "Sales Insight Automator API is running"}

@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}
