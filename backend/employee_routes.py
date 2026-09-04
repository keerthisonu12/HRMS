from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Request
from sqlalchemy.orm import Session

from database import SessionLocal
from models import User
from schemas import UserCreate
import cloudinary.uploader
import cloudinary_config
from decorators import role_required

router = APIRouter(prefix="/employees", tags=["Employees"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
@role_required("hr")
async def get_employees(
    request: Request,
    current_user: dict = None,
    db: Session = Depends(get_db)
):
    return db.query(User).all()


@router.get("/{email}")
async def get_employee(
    email: str,
    request: Request,
    current_user: dict = None,
    db: Session = Depends(get_db)
):
    if current_user is None:
        from auth import get_session
        authorization = request.headers.get("Authorization", "")
        token = authorization.replace("Bearer ", "").strip()
        current_user = get_session(token)

    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    if current_user["role"] != "hr" and current_user["email"] != email:
        raise HTTPException(status_code=403, detail="Access denied")

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=404, detail="Employee not found")

    return user


@router.put("/{email}")
@role_required("hr")
async def update_employee(
    email: str,
    request: Request,
    data: UserCreate,
    current_user: dict = None,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=404, detail="Employee not found")

    user.name = data.name
    user.email = data.email
    user.phone = data.phone
    user.role = data.role

    db.commit()
    db.refresh(user)

    return {
        "message": "Employee updated successfully",
        "employee": user
    }


@router.delete("/{email}")
@role_required("hr")
async def delete_employee(
    email: str,
    request: Request,
    current_user: dict = None,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=404, detail="Employee not found")

    db.delete(user)
    db.commit()

    return {"message": "Employee deleted successfully"}


@router.post("/{email}/profile-image")
async def upload_profile_image(
    email: str,
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    from auth import get_session

    authorization = request.headers.get("Authorization", "")
    token = authorization.replace("Bearer ", "").strip()
    current_user = get_session(token)

    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    if current_user["role"] != "hr" and current_user["email"] != email:
        raise HTTPException(status_code=403, detail="Access denied")

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=404, detail="Employee not found")

    contents = await file.read()

    result = cloudinary.uploader.upload(
        contents,
        folder="hrms_profiles"
    )

    user.profile_image = result["secure_url"]

    db.commit()
    db.refresh(user)

    return {
        "message": "Profile image uploaded successfully",
        "email": email,
        "image_url": result["secure_url"]
    }