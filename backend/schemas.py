from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    otp: str


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    role: str = "employee"