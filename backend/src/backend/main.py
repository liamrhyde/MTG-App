from contextlib import asynccontextmanager

from .repository import RepositoryDep
from fastapi import FastAPI
from db import init_db


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)


@app.get("/player/{player_id}")
def root(repository: RepositoryDep, player_id: int):
    return repository.get_player(player_id)
