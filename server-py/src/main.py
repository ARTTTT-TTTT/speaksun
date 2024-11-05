from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from dotenv import load_dotenv
import os

""" from starlette.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from starlette.middleware.base import BaseHTTPMiddleware """

from .auth import auth, login, google_auth
from .routers import users,progressions, exercises ,file_upload

app = FastAPI()
load_dotenv()

origins = [
    "http://localhost",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

secret_key = os.getenv("SECRET_KEY")

app.add_middleware(
    SessionMiddleware,
    secret_key=secret_key
)

""" app.add_middleware(GZipMiddleware, minimum_size=1000)

# ตัวอย่างการใช้งาน middleware อื่นๆ ที่อาจเป็นประโยชน์
app.add_middleware(
    TrustedHostMiddleware, allowed_hosts=["example.com", "*.example.com"]
)
app.add_middleware(HTTPSRedirectMiddleware)

# ตัวอย่างการสร้าง Custom Cache Middleware
class SimpleCacheMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_age=3600):
        super().__init__(app)
        self.max_age = max_age

    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["Cache-Control"] = f"public, max-age={self.max_age}"
        return response

app.add_middleware(SimpleCacheMiddleware, max_age=3600) """

app.include_router(auth.router, prefix="/auth", tags=["Authorization"])
app.include_router(login.router, prefix="/login", tags=["Login"])
app.include_router(google_auth.router, tags=["Google Authentication"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(progressions.router, prefix="/progressions", tags=["Progressions"])
app.include_router(exercises.router, prefix="/exercises", tags=['Exercises'])
app.include_router(file_upload.router, prefix="/files", tags=["File Upload"])