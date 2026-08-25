from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlmodel import SQLModel
from .db import engine


@asynccontextmanager
async def lifespan(_: FastAPI):
    SQLModel.metadata.create_all(engine)
    yield


app = FastAPI(lifespan=lifespan)


@app.get("/")
def root():
    return "Hello MTG Tracker"
