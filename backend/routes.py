from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User
from schemas import LoginRequest, UserCreate
from auth import generate_otp, save_otp, verify_otp, create_session, delete_session
from decorators import role_required

router = APIRouter()
users = {}


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/signup")
def signup(data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == data.email).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Public signup can only create employees
    user = User(
        name=data.name,
        email=data.email,
        phone=data.phone,
        role="employee"
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "User created successfully",
        "role": user.role
    }


@router.post("/send-otp")
def send_otp(email: str):
    email = email.strip().lower()

    otp = generate_otp()
    save_otp(email, otp)

    return {
        "message": "OTP sent successfully",
        "otp": otp
    }


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    email = data.email.strip().lower()
    otp = str(data.otp).strip()

    if not verify_otp(email, otp):
        raise HTTPException(
            status_code=401,
            detail="Invalid OTP"
        )

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    token = create_session(user.email, user.role)

    return {
        "message": "Login successful",
        "email": user.email,
        "role": user.role,
        "token": token
    }


@router.post("/logout")
def logout(request: Request):
    authorization = request.headers.get("Authorization")

    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "", 1).strip()
        delete_session(token)

    return {
        "message": "Logout successful"
    }


@router.get("/hr/dashboard")
@role_required("hr")
async def hr_dashboard(
    request: Request,
    current_user: dict = None
):
    return {
        "message": "HR Dashboard",
        "access": "HR only",
        "email": current_user["email"]
    }


@router.get("/employee/dashboard")
@role_required("employee")
async def employee_dashboard(
    request: Request,
    current_user: dict = None
):
    return {
        "message": "Employee Dashboard",
        "access": "Employee only",
        "email": current_user["email"]
    }