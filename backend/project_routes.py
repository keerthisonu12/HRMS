from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import date

from database import SessionLocal
from models import Project


router = APIRouter(prefix="/projects", tags=["Projects"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class ProjectRequest(BaseModel):
    name: str
    employee_email: str
    start_date: date
    end_date: date
    status: str = "active"


@router.post("/")
def create_project(data: ProjectRequest, db: Session = Depends(get_db)):
    project = Project(
        name=data.name,
        employee_email=data.employee_email,
        start_date=data.start_date,
        end_date=data.end_date,
        status=data.status
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    return {
        "message": "Project created successfully",
        "project": project
    }


@router.get("/")
def get_projects(db: Session = Depends(get_db)):
    return db.query(Project).all()


@router.get("/{email}")
def get_employee_projects(email: str, db: Session = Depends(get_db)):
    return db.query(Project).filter(Project.employee_email == email).all()