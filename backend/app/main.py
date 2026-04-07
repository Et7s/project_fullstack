#sportcenter-wireframes/backend/app/main.py
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .database import engine, Base
from .routers import auth, users, sections, diary, recommendations
import time
from .exceptions import NotFoundError, ForbiddenError, ConflictError, ValidationError

# Создание таблиц (для разработки, в production используйте миграции)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SportCenter API")

# CORS для React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # замените на адрес вашего фронта
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роутеры
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(sections.router)
app.include_router(diary.router)
app.include_router(recommendations.router)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    print(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.3f}s")
    return response

@app.exception_handler(NotFoundError)
async def not_found_handler(request: Request, exc: NotFoundError):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

@app.get("/")
def root():
    return {"message": "SportCenter API is running"}