from fastapi import FastAPI
from fastapi.responses import Response

# Инициализация FastAPI приложения
app = FastAPI()


# Делаем health check endpoint
@app.get("/health")
def health_check():
    return Response(status_code=200)  # Возвращаем 200 статус
