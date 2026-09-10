from functools import wraps

from fastapi import HTTPException, Request

from auth import get_session


def role_required(required_role):

    def decorator(func):

        @wraps(func)
        async def wrapper(*args, **kwargs):

            request = kwargs.get("request")

            if not isinstance(request, Request):
                raise HTTPException(
                    status_code=500,
                    detail="Authentication configuration error"
                )

            authorization = request.headers.get("Authorization")

            if not authorization:
                raise HTTPException(
                    status_code=401,
                    detail="Authentication required"
                )

            if not authorization.startswith("Bearer "):
                raise HTTPException(
                    status_code=401,
                    detail="Invalid authentication token"
                )

            token = authorization.replace(
                "Bearer ",
                "",
                1
            ).strip()

            session = get_session(token)

            if not session:
                raise HTTPException(
                    status_code=401,
                    detail="Invalid or expired session"
                )

            if session["role"] != required_role:
                raise HTTPException(
                    status_code=403,
                    detail="Access denied"
                )

            kwargs["current_user"] = session

            return await func(*args, **kwargs)

        return wrapper

    return decorator