from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import date

from database import SessionLocal
from models import WorkReport
from auth import get_session

router = APIRouter(prefix="/reports", tags=["Work Reports"])


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


class WorkReportRequest(BaseModel):
    employee_email: str
    project: str
    start_date: date
    end_date: date
    tag: str
    description: str


@router.post("/")
def create_report(
    data: WorkReportRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    user = get_current_user(request)

    if user["role"] != "hr" and user["email"] != data.employee_email:
        raise HTTPException(status_code=403, detail="Access denied")

    report = WorkReport(
        employee_email=data.employee_email,
        project=data.project,
        start_date=data.start_date,
        end_date=data.end_date,
        tag=data.tag,
        description=data.description
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    return {
        "message": "Work report added successfully",
        "report": report
    }


@router.get("/")
def get_reports(
    request: Request,
    db: Session = Depends(get_db)
):
    user = get_current_user(request)

    if user["role"] != "hr":
        raise HTTPException(status_code=403, detail="HR access required")

    return db.query(WorkReport).all()


@router.get("/{email}")
def get_employee_reports(
    email: str,
    request: Request,
    db: Session = Depends(get_db)
):
    user = get_current_user(request)

    if user["role"] != "hr" and user["email"] != email:
        raise HTTPException(status_code=403, detail="Access denied")

    return (
        db.query(WorkReport)
        .filter(WorkReport.employee_email == email)
        .all()
    )