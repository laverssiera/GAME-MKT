from typing import Any


class AppException(Exception):
    """Base application exception"""
    
    def __init__(
        self, 
        message: str, 
        status_code: int = 500,
        detail: dict[str, Any] | None = None
    ):
        self.message = message
        self.status_code = status_code
        self.detail = detail or {}
        super().__init__(self.message)


class ValidationError(AppException):
    """Validation error"""
    
    def __init__(self, message: str, detail: dict[str, Any] | None = None):
        super().__init__(message, status_code=422, detail=detail)


class NotFoundError(AppException):
    """Resource not found"""
    
    def __init__(self, resource: str):
        message = f"{resource} not found"
        super().__init__(message, status_code=404)


class UnauthorizedError(AppException):
    """Unauthorized access"""
    
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(message, status_code=401)


class ForbiddenError(AppException):
    """Forbidden access"""
    
    def __init__(self, message: str = "Forbidden"):
        super().__init__(message, status_code=403)


class ConflictError(AppException):
    """Resource conflict"""
    
    def __init__(self, message: str):
        super().__init__(message, status_code=409)
