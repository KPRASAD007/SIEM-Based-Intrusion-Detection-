from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "DEBUG: Minimal Server is ONLINE"}

@app.get("/api/auth/login")
async def mock_login():
    return {"status": "success", "username": "admin"}
