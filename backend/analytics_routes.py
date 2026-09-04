from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import WorkReport


router = APIRouter(prefix="/analytics", tags=["Work Analytics"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def work_analytics(db: Session = Depends(get_db)):
    reports = db.query(WorkReport).all()
    total = len(reports)

    if total == 0:
        return {"message": "No work reports available"}

    employee_counts = {}

    for report in reports:
        email = report.employee_email
        employee_counts[email] = employee_counts.get(email, 0) + 1

    analytics = []

    for email, count in employee_counts.items():
        percentage = round((count / total) * 100, 2)

        analytics.append({
            "employee_email": email,
            "work_reports": count,
            "work_percentage": percentage
        })

    return analytics