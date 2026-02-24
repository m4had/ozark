# ozark
project/
 ├─ app/
 │   ├─ main.py
 │   ├─ models.py
 │   ├─ db.py
 │   └─ routes/
 │       └─ transactions.py
 ├─ requirements.txt
 ├─ Dockerfile
 ├─ render.yaml  (or railway.json)
 └─ README.md
from sqlmodel import SQLModel, create_engine, Session
import os

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL, echo=True)

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class Transaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    amount: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    source: str
    destination: str
from fastapi import APIRouter, Depends
from sqlmodel import select
from app.models import Transaction
from app.db import get_session

router = APIRouter()

@router.post("/")
def create_tx(tx: Transaction, session=Depends(get_session)):
    session.add(tx)
    session.commit()
    session.refresh(tx)
    return tx

@router.get("/")
def list_tx(session=Depends(get_session)):
    return session.exec(select(Transaction)).all()
from fastapi import FastAPI
from app.routes import transactions
from app.db import init_db

app = FastAPI(title="Sandbox Transactions")
app.include_router(transactions.router, prefix="/tx", tags=["transactions"])

@app.on_event("startup")
def setup():
    init_db()

@app.get("/")
def root():
    return {"status": "running"}
fastapi
uvicorn[standard]
sqlmodel
psycopg2-binary
FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
services:
  - type: web
    name: sandbox-api
    env: python
    plan: free
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port 8000
    envVars:
      DATABASE_URL: postgres://user:pass@host:port/db
databases:
  - name: sandbox-db
/Dockerfile
/app/main.py
/requirements.txt
DATABASE_URL=postgresql://user:pass@your-db-host/dbname
