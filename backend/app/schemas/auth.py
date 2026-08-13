from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=255)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    id: int
    email: str

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    success: bool = True
    message: str
    data: UserResponse | LoginResponse | None = None
