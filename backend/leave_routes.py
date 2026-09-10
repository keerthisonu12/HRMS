from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import date
import os

from database import SessionLocal
from models import Leave

from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType


router = APIRouter(prefix="/leaves", tags=["Leaves"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Existing WORKNEST email configuration
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


class LeaveRequest(BaseModel):
    email: str
    start_date: date
    end_date: date
    reason: str


@router.post("/")
def apply_leave(data: LeaveRequest, db: Session = Depends(get_db)):
    leave = Leave(
        email=data.email,
        start_date=data.start_date,
        end_date=data.end_date,
        reason=data.reason,
        status="pending"
    )

    db.add(leave)
    db.commit()
    db.refresh(leave)

    return {
        "message": "Leave applied successfully",
        "leave": leave
    }


@router.get("/")
def get_leaves(db: Session = Depends(get_db)):
    return db.query(Leave).all()


@router.put("/{email}/approve")
async def approve_leave(email: str, db: Session = Depends(get_db)):
    leave = (
        db.query(Leave)
        .filter(Leave.email == email, Leave.status == "pending")
        .first()
    )

    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")

    leave.status = "approved"
    db.commit()
    db.refresh(leave)

    # Send approval email to employee
    try:
        message = MessageSchema(
            subject="WORKNEST | Leave Request Approved",
            recipients=[leave.email],
            body=f"""
            <html>
                <body style="font-family: Arial, sans-serif; background:#f5f7fb; padding:30px;">
                    <div style="max-width:600px; margin:auto; background:white; padding:30px; border-radius:15px;">
                        <h2 style="color:#7057ed;">WORKNEST</h2>
                        <h3 style="color:#22a06b;">Leave Request Approved</h3>

                        <p>Your leave request has been <b>approved by HR</b>.</p>

                        <p><b>Leave Details:</b></p>
                        <p>Start Date: {leave.start_date}</p>
                        <p>End Date: {leave.end_date}</p>
                        <p>Reason: {leave.reason}</p>
                        <p>Status: <b style="color:#22a06b;">Approved</b></p>

                        <p style="margin-top:25px;">
                            Your leave has been approved by HR.
                        </p>

                        <p>Regards,<br><b>WORKNEST HR Team</b></p>
                    </div>
                </body>
            </html>
            """,
            subtype=MessageType.html
        )

        fm = FastMail(mail_conf)
        await fm.send_message(message)

    except Exception as e:
        print("Leave approval email failed:", e)

    return {
        "message": "Leave approved",
        "leave": leave
    }


@router.put("/{email}/decline")
async def decline_leave(email: str, db: Session = Depends(get_db)):
    leave = (
        db.query(Leave)
        .filter(Leave.email == email, Leave.status == "pending")
        .first()
    )

    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")

    leave.status = "declined"
    db.commit()
    db.refresh(leave)

    # Send rejection email to employee
    try:
        message = MessageSchema(
            subject="WORKNEST | Leave Request Declined",
            recipients=[leave.email],
            body=f"""
            <html>
                <body style="font-family: Arial, sans-serif; background:#f5f7fb; padding:30px;">
                    <div style="max-width:600px; margin:auto; background:white; padding:30px; border-radius:15px;">
                        <h2 style="color:#7057ed;">WORKNEST</h2>
                        <h3 style="color:#d64545;">Leave Request Declined</h3>

                        <p>Your leave request has been <b>declined by HR</b>.</p>

                        <p><b>Leave Details:</b></p>
                        <p>Start Date: {leave.start_date}</p>
                        <p>End Date: {leave.end_date}</p>
                        <p>Reason: {leave.reason}</p>
                        <p>Status: <b style="color:#d64545;">Declined</b></p>

                        <p style="margin-top:25px;">
                            Your leave request was declined by HR.
                        </p>

                        <p>Regards,<br><b>WORKNEST HR Team</b></p>
                    </div>
                </body>
            </html>
            """,
            subtype=MessageType.html
        )

        fm = FastMail(mail_conf)
        await fm.send_message(message)

    except Exception as e:
        print("Leave rejection email failed:", e)

    return {
        "message": "Leave declined",
        "leave": leave
    }