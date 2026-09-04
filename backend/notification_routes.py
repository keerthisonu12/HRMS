from fastapi import APIRouter, Depends, Request, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import date

from database import SessionLocal
from models import Notification
from auth import get_session

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
        raise HTTPException(status_code=401, detail="Authentication required")

    token = authorization.replace("Bearer ", "", 1).strip()
    user = get_session(token)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")

    return user


class NotificationRequest(BaseModel):
    title: str
    message: str
    category: str
    date: date


@router.post("/")
def create_notification(
    data: NotificationRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    user = get_current_user(request)

    if user["role"] != "hr":
        raise HTTPException(status_code=403, detail="HR access required")

    notification = Notification(
        title=data.title,
        message=data.message,
        category=data.category,
        date=data.date
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return {
        "message": "Notification created successfully",
        "notification": notification
    }


@router.get("/")
def get_notifications(
    request: Request,
    db: Session = Depends(get_db)
):
    get_current_user(request)

    return db.query(Notification).all()