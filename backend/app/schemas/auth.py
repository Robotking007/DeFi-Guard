from pydantic import BaseModel, EmailStr, Field


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    email: str


class TokenData(BaseModel):
    user_id: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: str = Field(default="user", pattern="^(user|analyst|admin)$")


class NonceResponse(BaseModel):
    nonce: str


class SIWEVerifyRequest(BaseModel):
    address: str = Field(..., min_length=42, max_length=66)
    message: str
    signature: str


class Web3AuthLoginRequest(BaseModel):
    public_address: str = Field(..., min_length=42, max_length=66)
    email: str | None = None
    id_token: str | None = None
