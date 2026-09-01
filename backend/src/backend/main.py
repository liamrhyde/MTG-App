from db.records import Deck, Player
from contextlib import asynccontextmanager

from .repository import RepositoryDep
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import init_db


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/player/{player_id}")
def get_player(repository: RepositoryDep, player_id: int):
    return repository.get_player(player_id)


@app.get("/players")
def get_players(repository: RepositoryDep):
    players = repository.get_players()
    return {p.id: p for p in players}


@app.post("/player")
def create_player(player: Player, repository: RepositoryDep):
    return repository.create_player(player)


@app.get("/deck/{deck_id}")
def get_deck(repository: RepositoryDep, deck_id: int):
    return repository.get_deck(deck_id)


@app.get("/decks")
def get_decks(repository: RepositoryDep):
    decks = repository.get_decks()
    return {d.id: d for d in decks}


@app.post("/deck")
def create_deck(deck: Deck, repository: RepositoryDep):
    return repository.create_deck(deck)


@app.get("/game/{game_id}")
def get_game(repository: RepositoryDep, game_id: int):
    return repository.get_game(game_id)


@app.get("/games")
def get_games(repository: RepositoryDep):
    games = repository.get_games()
    return {g.id: g for g in games}
