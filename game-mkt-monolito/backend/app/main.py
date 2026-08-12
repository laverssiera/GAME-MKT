from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.core.config import get_settings
from app.core.exceptions import AppException
from app.api import router
from app.observability.tracing import init_tracing
from app.observability.logger import log_info, log_error
from app.db.session import Base, engine
from app.events.interplanetary_subscribers import (
    get_interplanetary_subscribers_state,
    start_interplanetary_subscribers,
)

settings = get_settings()


# Create tables
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown"""
    # Startup
    log_info("Application starting", app_name=settings.app_name, version=settings.app_version)
    init_tracing(app)
    try:
        subscribers_state = await start_interplanetary_subscribers()
        log_info("Interplanetary subscribers startup", **subscribers_state)
    except Exception as subscribers_error:
        log_error("Failed to initialize interplanetary subscribers", error=str(subscribers_error))
    
    yield
    
    # Shutdown
    log_info("Application shutting down")


# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="GAME MKT - Revenue Operating System",
    lifespan=lifespan
)


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handlers
@app.exception_handler(AppException)
async def app_exception_handler(request, exc: AppException):
    """Handle application exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.message,
            "status_code": exc.status_code,
            "error_code": exc.detail.get("error_code", "UNKNOWN_ERROR"),
        },
    )


# Include routers
app.include_router(router)


# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.app_version,
        "interplanetary_subscribers": get_interplanetary_subscribers_state(),
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "GAME MKT - Revenue Operating System",
        "version": settings.app_version,
        "docs": "/docs",
        "status": "running"
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    )
