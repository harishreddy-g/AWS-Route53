"""Domain exceptions mapped to HTTP responses in main.py."""


class AppError(Exception):
    """Base application error."""

    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(message)


class NotFoundError(AppError):
    pass


class ConflictError(AppError):
    pass


class ValidationError(AppError):
    pass


class UnauthorizedError(AppError):
    pass
