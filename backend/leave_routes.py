from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import date

from database import SessionLocal
from models import Leave


router = APIRouter(prefix="/leaves", tags=["Leaves"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


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
def approve_leave(email: str, db: Session = Depends(get_db)):
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

    return {
        "message": "Leave approved",
        "leave": leave
    }


@router.put("/{email}/decline")
def decline_leave(email: str, db: Session = Depends(get_db)):
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

    return {
        "message": "Leave declined",
        "leave": leave
    }