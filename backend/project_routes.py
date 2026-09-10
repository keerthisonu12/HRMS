import os

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from datetime import date

from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType

from database import SessionLocal
from models import Project


router = APIRouter(prefix="/projects", tags=["Projects"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- EMAIL CONFIGURATION ----------------

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


class ProjectRequest(BaseModel):
    name: str
    employee_emails: list[str] = Field(min_length=1)
    start_date: date
    end_date: date
    status: str = "active"


@router.post("/")
async def create_project(
    data: ProjectRequest,
    db: Session = Depends(get_db)
):
    if data.start_date > data.end_date:
        raise HTTPException(
            status_code=400,
            detail="End date cannot be before start date"
        )

    employee_emails = [
        email.strip().lower()
        for email in data.employee_emails
        if email.strip()
    ]

    if not employee_emails:
        raise HTTPException(
            status_code=400,
            detail="Please select at least one employee"
        )

    created_projects = []

    # ---------------- CREATE PROJECTS ----------------

    for employee_email in employee_emails:
        project = Project(
            name=data.name,
            employee_email=employee_email,
            start_date=data.start_date,
            end_date=data.end_date,
            status=data.status
        )

        db.add(project)
        created_projects.append(project)

    db.commit()

    for project in created_projects:
        db.refresh(project)

    # ---------------- SEND EMAIL TO EMPLOYEES ----------------

    email_failed = []

    for employee_email in employee_emails:

        message = MessageSchema(
            subject="WORKNEST | New Project Assigned",
            recipients=[employee_email],
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
        padding:35px 30px;
        text-align:center;
        color:white;
    ">

        <div style="
            font-size:38px;
            margin-bottom:10px;
        ">
            💼
        </div>

        <h1 style="
            margin:0;
            font-size:30px;
            letter-spacing:2px;
        ">
            WORKNEST
        </h1>

        <p style="
            margin:8px 0 0;
            font-size:13px;
            opacity:0.92;
        ">
            People • Performance • Progress
        </p>

    </div>


    <!-- CONTENT -->

    <div style="padding:38px;">

        <h2 style="
            margin:0 0 12px;
            color:#1e293b;
            font-size:24px;
        ">
            New Project Assigned
        </h2>

        <p style="
            color:#475569;
            font-size:15px;
            line-height:1.7;
        ">
            Hello,
        </p>

        <p style="
            color:#475569;
            font-size:15px;
            line-height:1.7;
        ">
            A new project has been assigned to you by the
            <strong>WORKNEST HR Team</strong>.
        </p>


        <!-- PROJECT CARD -->

        <div style="
            margin:28px 0;
            padding:25px;
            background:linear-gradient(135deg,#eff6ff,#f5f3ff);
            border:1px solid #dbe4ff;
            border-radius:16px;
        ">

            <p style="
                margin:0 0 8px;
                color:#64748b;
                font-size:11px;
                font-weight:bold;
                letter-spacing:2px;
            ">
                PROJECT DETAILS
            </p>

            <h2 style="
                margin:0 0 20px;
                color:#2563eb;
                font-size:22px;
            ">
                {data.name}
            </h2>

            <p style="
                margin:8px 0;
                color:#334155;
                font-size:14px;
            ">
                <strong>Start Date:</strong>
                {data.start_date}
            </p>

            <p style="
                margin:8px 0;
                color:#334155;
                font-size:14px;
            ">
                <strong>End Date:</strong>
                {data.end_date}
            </p>

            <p style="
                margin:8px 0;
                color:#334155;
                font-size:14px;
            ">
                <strong>Status:</strong>
                {data.status}
            </p>

        </div>


        <!-- DASHBOARD MESSAGE -->

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
                📌 Please check your WORKNEST dashboard
                for project-related updates and work reports.
            </p>

        </div>


        <p style="
            color:#64748b;
            font-size:13px;
            line-height:1.7;
        ">
            This project has been added to your WORKNEST
            project list.
        </p>


        <p style="
            margin-top:28px;
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
        padding:22px;
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
            email_failed.append(employee_email)


    # ---------------- RESPONSE ----------------

    response = {
        "message": "Project created successfully",
        "employees_assigned": len(created_projects),
        "projects": created_projects
    }

    if email_failed:
        response["email_warning"] = (
            "Project created, but email could not be sent to: "
            + ", ".join(email_failed)
        )
    else:
        response["email_message"] = (
            "Project assignment email sent successfully"
        )

    return response


@router.get("/")
def get_projects(
    db: Session = Depends(get_db)
):
    return db.query(Project).all()


@router.get("/{email}")
def get_employee_projects(
    email: str,
    db: Session = Depends(get_db)
):
    email = email.strip().lower()

    return (
        db.query(Project)
        .filter(Project.employee_email == email)
        .all()
    )