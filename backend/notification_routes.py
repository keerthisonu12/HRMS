import requests
import os

from fastapi import APIRouter, Depends, Request, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import date, datetime

from database import SessionLocal
from models import Notification, User
from auth import get_session

from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType


router = APIRouter(prefix="/notifications", tags=["Notifications"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(request: Request):
    authorization = request.headers.get("Authorization", "")

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )

    token = authorization.replace("Bearer ", "", 1).strip()
    user = get_session(token)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid session"
        )

    return user


class NotificationRequest(BaseModel):
    title: str
    message: str
    category: str
    date: date


# EMAIL CONFIGURATION
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


@router.post("/")
async def create_notification(
    data: NotificationRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    user = get_current_user(request)

    if user["role"] != "hr":
        raise HTTPException(
            status_code=403,
            detail="HR access required"
        )

    # SAVE NOTIFICATION
    notification = Notification(
        title=data.title,
        message=data.message,
        category=data.category,
        date=data.date
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    # SEND EMAIL TO ALL EMPLOYEES
    employees = db.query(User).filter(
        User.role == "employee"
    ).all()

    email_failed = []

    for employee in employees:
        try:
            message = MessageSchema(
                subject=f"WORKNEST | {data.title}",
                recipients=[employee.email],
                body=f"""
                <html>
                <body style="
                    margin:0;
                    padding:30px;
                    background:#f5f7fb;
                    font-family:Arial,sans-serif;
                ">

                    <div style="
                        max-width:600px;
                        margin:auto;
                        background:#ffffff;
                        border-radius:18px;
                        padding:30px;
                        box-shadow:0 8px 25px rgba(0,0,0,0.08);
                    ">

                        <div style="
                            text-align:center;
                            margin-bottom:25px;
                        ">
                            <h1 style="
                                margin:0;
                                color:#6254e9;
                                font-size:26px;
                            ">
                                WORKNEST
                            </h1>

                            <p style="
                                margin:5px 0 0;
                                color:#8a94aa;
                                font-size:13px;
                            ">
                                People • Performance • Progress
                            </p>
                        </div>

                        <div style="
                            padding:18px;
                            border-radius:14px;
                            background:#f7f5ff;
                            border:1px solid #e5e0ff;
                        ">

                            <p style="
                                margin:0 0 8px;
                                color:#6254e9;
                                font-size:11px;
                                font-weight:bold;
                                letter-spacing:1.5px;
                            ">
                                {data.category.upper()}
                            </p>

                            <h2 style="
                                margin:0 0 12px;
                                color:#18233b;
                                font-size:21px;
                            ">
                                {data.title}
                            </h2>

                            <p style="
                                margin:0;
                                color:#59647b;
                                font-size:14px;
                                line-height:1.7;
                            ">
                                {data.message}
                            </p>

                            <p style="
                                margin:18px 0 0;
                                color:#8a94aa;
                                font-size:12px;
                            ">
                                Date: {data.date}
                            </p>

                        </div>

                        <p style="
                            margin:25px 0 0;
                            text-align:center;
                            color:#8a94aa;
                            font-size:11px;
                        ">
                            This notification was sent by HR through WORKNEST.
                        </p>

                    </div>

                </body>
                </html>
                """,
                subtype=MessageType.html
            )

            fm = FastMail(mail_conf)
            await fm.send_message(message)

        except Exception as e:
            print(
                f"Notification email failed for {employee.email}:",
                e
            )
            email_failed.append(employee.email)

    response = {
        "message": "Notification created and sent successfully",
        "notification": notification
    }

    if email_failed:
        response["email_warning"] = (
            "Notification created, but email could not be sent to: "
            + ", ".join(email_failed)
        )
    else:
        response["email_message"] = (
            "Notification email sent successfully to all employees."
        )

    return response


@router.get("/")
def get_notifications(
    request: Request,
    db: Session = Depends(get_db)
):
    get_current_user(request)

    notifications = db.query(Notification).all()

    return [
        {
            "id": item.id,
            "title": item.title,
            "message": item.message,
            "category": item.category,
            "date": item.date
        }
        for item in notifications
    ]


@router.get("/holidays")
def get_upcoming_holidays(request: Request):
    get_current_user(request)

    today = date.today()
    year = today.year

    # Try the public holiday API first
    try:
        response = requests.get(
            f"https://date.nager.at/api/v3/PublicHolidays/{year}/IN",
            timeout=10
        )

        response.raise_for_status()

        holidays = response.json()

        upcoming = []

        for holiday in holidays:
            holiday_date = datetime.strptime(
                holiday["date"],
                "%Y-%m-%d"
            ).date()

            if holiday_date >= today:
                upcoming.append({
                    "id": f"holiday-{holiday_date}-{holiday['name']}",
                    "title": holiday["name"],
                    "message": (
                        f"Upcoming public holiday: "
                        f"{holiday['name']}"
                    ),
                    "category": "Holiday",
                    "date": holiday["date"],
                    "country": "India"
                })

        if upcoming:
            return upcoming

    except requests.RequestException:
        pass

    # Fallback India holiday list
    fallback_holidays = [
        ("2026-09-14", "Ganesh Chaturthi"),
        ("2026-10-02", "Gandhi Jayanti"),
        ("2026-10-20", "Diwali"),
        ("2026-11-08", "Guru Nanak Jayanti"),
        ("2026-12-25", "Christmas Day"),
    ]

    upcoming = []

    for holiday_date, holiday_name in fallback_holidays:
        holiday_date_obj = datetime.strptime(
            holiday_date,
            "%Y-%m-%d"
        ).date()

        if holiday_date_obj >= today:
            upcoming.append({
                "id": f"holiday-{holiday_date}-{holiday_name}",
                "title": holiday_name,
                "message": (
                    f"Upcoming public holiday: "
                    f"{holiday_name}"
                ),
                "category": "Holiday",
                "date": holiday_date,
                "country": "India"
            })

    return upcoming