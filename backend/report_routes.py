from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import date, datetime, time

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
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )

    token = authorization.replace(
        "Bearer ",
        "",
        1
    ).strip()

    user = get_session(token)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid session"
        )

    return user


class WorkReportRequest(BaseModel):
    employee_email: str
    project: str
    start_date: date
    end_date: date
    tag: str
    description: str


# ---------------- CREATE REPORT ----------------

@router.post("/")
def create_report(
    data: WorkReportRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    user = get_current_user(request)

    if user["role"] != "hr" and user["email"] != data.employee_email:
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

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


# ---------------- GET ALL REPORTS ----------------

@router.get("/")
def get_reports(
    request: Request,
    db: Session = Depends(get_db)
):
    user = get_current_user(request)

    if user["role"] != "hr":
        raise HTTPException(
            status_code=403,
            detail="HR access required"
        )

    return db.query(WorkReport).all()


# ---------------- GET EMPLOYEE REPORTS ----------------

@router.get("/{email}")
def get_employee_reports(
    email: str,
    request: Request,
    db: Session = Depends(get_db)
):
    user = get_current_user(request)

    if user["role"] != "hr" and user["email"] != email:
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    return (
        db.query(WorkReport)
        .filter(
            WorkReport.employee_email == email
        )
        .all()
    )


# ---------------- EDIT WORK REPORT ----------------

@router.put("/{report_id}")
def update_report(
    report_id: int,
    data: WorkReportRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    user = get_current_user(request)

    # Only employees can edit reports
    if user["role"] != "employee":
        raise HTTPException(
            status_code=403,
            detail="Only employees can edit work reports"
        )

    # Working hours: 9:00 AM - 7:00 PM
    current_time = datetime.now().time()

    working_start = time(9, 0)
    working_end = time(19, 0)

    if not (
        working_start <= current_time <= working_end
    ):
        raise HTTPException(
            status_code=403,
            detail="Work reports can only be edited during working hours (9:00 AM - 7:00 PM)"
        )

    report = (
        db.query(WorkReport)
        .filter(
            WorkReport.id == report_id
        )
        .first()
    )

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Work report not found"
        )

    # Employee can edit only their own report
    if report.employee_email != user["email"]:
        raise HTTPException(
            status_code=403,
            detail="You can edit only your own work reports"
        )

    # Employee email cannot be changed
    if data.employee_email != user["email"]:
        raise HTTPException(
            status_code=403,
            detail="Employee email cannot be changed"
        )

    # Update report
    report.project = data.project
    report.start_date = data.start_date
    report.end_date = data.end_date
    report.tag = data.tag
    report.description = data.description

    db.commit()
    db.refresh(report)

    return {
        "message": "Work report updated successfully",
        "report": report
    }