from fastapi import FastAPI, HTTPException
from app.api.v1.wallets import router as wallet_router
from app.api.v1.operations import router as operations_router
from app.api.v1.users import router as users_router
from app.database import Base, engine
from fastapi.middleware.cors import CORSMiddleware

# Инициализация FastAPI приложения
app = FastAPI()

# Подключаем роутер для кошельков с префиксом /api/v1
app.include_router(wallet_router, prefix="/api/v1", tags=["wallet"])
# Подключаем роутер для операций с префиксом /api/v1
app.include_router(operations_router, prefix="/api/v1", tags=["operations"])
# Подключаем роутер для операций с префиксом /api/v1
app.include_router(users_router, prefix="/api/v1", tags=["users"])

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], # Разрешаем твоему фронтенду
    allow_credentials=True,
    allow_methods=["*"], # Разрешаем все методы (GET, POST и т.д.)
    allow_headers=["*"], # Разрешаем все заголовки (включая Authorization)
)