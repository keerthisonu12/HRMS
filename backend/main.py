from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
import models

from routes import router
from employee_routes import router as employee_router
from leave_routes import router as leave_router
from project_routes import router as project_router
from report_routes import router as report_router
from analytics_routes import router as analytics_router
from notification_routes import router as notification_router


Base.metadata.create_all(bind=engine)

app = FastAPI(title="HRMS API")


# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://worknest-hrms-frontend.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# API Routers
app.include_router(router)
app.include_router(employee_router)
app.include_router(leave_router)
app.include_router(project_router)
app.include_router(report_router)
app.include_router(analytics_router)
app.include_router(notification_router)


@app.get("/")
def root():
    return {"message": "HRMS API is working"}


# Add Bearer authentication to Swagger
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    from fastapi.openapi.utils import get_openapi

    openapi_schema = get_openapi(
        title="HRMS API",
        version="1.0.0",
        description="Human Resource Management System API",
        routes=app.routes,
    )

    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }

    public_paths = {
        "/signup",
        "/send-otp",
        "/login",
        "/logout",
        "/",
    }

    for path, methods in openapi_schema["paths"].items():
        if path not in public_paths:
            for method in methods:
                methods[method]["security"] = [
                    {"BearerAuth": []}
                ]

    app.openapi_schema = openapi_schema

    return app.openapi_schema


app.openapi = custom_openapi