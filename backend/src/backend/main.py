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
def get_player(repository: RepositoryDep, player_id: int):
    return repository.get_player(player_id)


@app.get("/players")
def get_players(repository: RepositoryDep):
    return repository.get_players()


@app.get("/deck/{deck_id}")
def get_deck(repository: RepositoryDep, deck_id: int):
    return repository.get_deck(deck_id)


@app.get("/decks")
def get_decks(repository: RepositoryDep):
    return repository.get_decks()


@app.get("/game/{game_id}")
def get_game(repository: RepositoryDep, game_id: int):
    return repository.get_game(game_id)


@app.get("/games")
def get_games(repository: RepositoryDep):
    return repository.get_games()
