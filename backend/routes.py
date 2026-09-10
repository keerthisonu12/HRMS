import os

from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType

from database import SessionLocal
from models import User
from schemas import LoginRequest, UserCreate

from auth import (
    generate_otp,
    save_otp,
    verify_otp,
    create_session,
    get_session,
    delete_session,
    create_reset_request
)

from decorators import role_required


router = APIRouter()


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


mail_conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("HR_EMAIL"),
    MAIL_PASSWORD=os.getenv("HR_EMAIL_PASSWORD"),
    MAIL_FROM=os.getenv("HR_EMAIL"),
    MAIL_PORT=465,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=False,
    MAIL_SSL_TLS=True,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)


# ---------------- SIGNUP ----------------

@router.post("/signup")
def signup(
    data: UserCreate,
    db: Session = Depends(get_db)
):
    email = data.email.strip().lower()

    if email == os.getenv("HR_EMAIL", "").strip().lower():
        raise HTTPException(
            status_code=400,
            detail="HR email cannot be used for employee signup"
        )

    existing_user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    user = User(
        name=data.name,
        email=email,
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


# ---------------- SEND OTP ----------------

@router.post("/send-otp")
async def send_otp(
    email: str,
    db: Session = Depends(get_db)
):
    email = email.strip().lower()
    hr_email = os.getenv("HR_EMAIL", "").strip().lower()

    if email == hr_email:
        user_name = "HR Admin"
    else:
        user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=404,
                detail="Email is not registered"
            )

        user_name = user.name

    otp = generate_otp()
    save_otp(email, otp)

    # ---------------- COLORFUL WORKNEST OTP EMAIL ----------------

    message = MessageSchema(
        subject="WORKNEST | Login Verification OTP",
        recipients=[email],
        body=f"""
<html>
<body style="
    margin:0;
    padding:0;
    background:#eef2ff;
    font-family:Arial, Helvetica, sans-serif;
">

    <div style="
        max-width:650px;
        margin:40px auto;
        background:#ffffff;
        border-radius:20px;
        overflow:hidden;
        box-shadow:0 10px 30px rgba(0,0,0,0.10);
    ">

        <!-- HEADER -->

        <div style="
            background:linear-gradient(135deg,#2563eb,#7c3aed);
            padding:38px 30px;
            text-align:center;
            color:white;
        ">

            <div style="
                width:82px;
                height:82px;
                background:#ffffff;
                border-radius:50%;
                margin:0 auto 15px;
                line-height:82px;
                font-size:40px;
            ">
                💼
            </div>

            <h1 style="
                margin:0;
                font-size:34px;
                letter-spacing:2px;
            ">
                WORKNEST
            </h1>

            <p style="
                margin:8px 0 0;
                font-size:14px;
                opacity:0.92;
            ">
                People • Performance • Progress
            </p>

        </div>


        <!-- MAIN CONTENT -->

        <div style="
            padding:40px;
        ">

            <div style="
                text-align:center;
                margin-bottom:30px;
            ">

                <h2 style="
                    margin:0 0 10px;
                    color:#1e293b;
                    font-size:24px;
                ">
                    Login Verification
                </h2>

                <p style="
                    margin:0;
                    color:#64748b;
                    font-size:14px;
                ">
                    Secure access to your WORKNEST HRMS account
                </p>

            </div>


            <p style="
                color:#334155;
                font-size:15px;
                line-height:1.8;
            ">
                Hello <strong>{user_name}</strong>,
            </p>


            <p style="
                color:#475569;
                font-size:15px;
                line-height:1.8;
            ">
                We received a request to access your
                <strong>WORKNEST HRMS</strong> account.
                Use the verification code below to continue.
            </p>


            <!-- OTP CARD -->

            <div style="
                margin:32px 0;
                padding:30px;
                text-align:center;
                background:linear-gradient(135deg,#eff6ff,#f5f3ff);
                border:2px dashed #6366f1;
                border-radius:18px;
            ">

                <p style="
                    margin:0 0 12px;
                    color:#64748b;
                    font-size:12px;
                    font-weight:bold;
                    letter-spacing:3px;
                ">
                    YOUR VERIFICATION CODE
                </p>

                <div style="
                    font-size:42px;
                    font-weight:bold;
                    letter-spacing:12px;
                    color:#2563eb;
                ">
                    {otp}
                </div>

            </div>


            <!-- VALIDITY -->

            <div style="
                background:#fff7ed;
                border-left:5px solid #f59e0b;
                border-radius:8px;
                padding:16px 18px;
                margin-bottom:15px;
            ">

                <p style="
                    margin:0;
                    color:#92400e;
                    font-size:14px;
                ">
                    ⏰ <strong>OTP Validity:</strong>
                    This verification code is valid for
                    <strong>24 hours</strong>.
                </p>

            </div>


            <!-- SECURITY -->

            <div style="
                background:#f0fdf4;
                border-left:5px solid #22c55e;
                border-radius:8px;
                padding:16px 18px;
                margin-bottom:25px;
            ">

                <p style="
                    margin:0;
                    color:#166534;
                    font-size:14px;
                ">
                    🔒 <strong>Security:</strong>
                    Never share this verification code with anyone.
                </p>

            </div>


            <p style="
                color:#64748b;
                font-size:13px;
                line-height:1.7;
            ">
                If you did not request this login verification,
                you can safely ignore this email.
            </p>


            <p style="
                margin-top:30px;
                color:#475569;
                font-size:14px;
                line-height:1.7;
            ">
                Thanks,<br>
                <strong style="color:#2563eb;">
                    WORKNEST HR Team
                </strong>
            </p>

        </div>


        <!-- FOOTER -->

        <div style="
            background:linear-gradient(135deg,#f8fafc,#eef2ff);
            padding:25px;
            text-align:center;
            border-top:1px solid #e2e8f0;
        ">

            <p style="
                margin:0;
                color:#64748b;
                font-size:12px;
            ">
                This is an automated email from WORKNEST HRMS.
            </p>

            <p style="
                margin:8px 0 0;
                color:#94a3b8;
                font-size:12px;
            ">
                © 2026 WORKNEST • People • Performance • Progress
            </p>

        </div>

    </div>

</body>
</html>
        """,
        subtype=MessageType.html
    )

    try:
        await FastMail(mail_conf).send_message(message)

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to send OTP email"
        )

    return {
        "message": "Verification OTP sent successfully"
    }


# ---------------- LOGIN ----------------

@router.post("/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):
    email = data.email.strip().lower()
    otp = str(data.otp).strip()
    hr_email = os.getenv("HR_EMAIL", "").strip().lower()

    if not verify_otp(email, otp):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired OTP"
        )

    if email == hr_email:
        role = "hr"

        return {
            "message": "Login successful",
            "email": email,
            "role": role,
            "token": create_session(email, role)
        }

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    token = create_session(
        user.email,
        user.role
    )

    return {
        "message": "Login successful",
        "email": user.email,
        "role": user.role,
        "token": token
    }


# ---------------- CHECK AUTHENTICATION ----------------

@router.get("/auth/me")
def get_current_user(request: Request):

    authorization = request.headers.get("Authorization")

    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token"
        )

    token = authorization.replace(
        "Bearer ",
        "",
        1
    ).strip()

    session = get_session(token)

    if not session:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired session"
        )

    return {
        "authenticated": True,
        "email": session["email"],
        "role": session["role"]
    }


# ---------------- FORGOT PASSWORD ----------------

@router.post("/forgot-password")
async def forgot_password(
    email: str,
    db: Session = Depends(get_db)
):
    email = email.strip().lower()

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Employee email not found"
        )

    reset_token = create_reset_request(email)

    message = MessageSchema(
        subject="WORKNEST - Password Reset Request",
        recipients=[os.getenv("HR_EMAIL")],
        body=f"""
        <h2>WORKNEST HRMS</h2>

        <p>A password reset request has been received.</p>

        <p>
            <strong>Employee Name:</strong> {user.name}
        </p>

        <p>
            <strong>Employee Email:</strong> {user.email}
        </p>

        <p>
            <strong>Reset Request Token:</strong>
        </p>

        <p>{reset_token}</p>

        <p>
            This reset request is valid for
            <strong>24 hours</strong>.
        </p>
        """,
        subtype=MessageType.html
    )

    try:
        await FastMail(mail_conf).send_message(message)

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to send reset request to HR"
        )

    return {
        "message": "Password reset request sent to HR successfully"
    }


# ---------------- LOGOUT ----------------

@router.post("/logout")
def logout(request: Request):

    authorization = request.headers.get("Authorization")

    if authorization and authorization.startswith("Bearer "):

        token = authorization.replace(
            "Bearer ",
            "",
            1
        ).strip()

        delete_session(token)

    return {
        "message": "Logout successful"
    }


# ---------------- HR DASHBOARD ----------------

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


# ---------------- EMPLOYEE DASHBOARD ----------------

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