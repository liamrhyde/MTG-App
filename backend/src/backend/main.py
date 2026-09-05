from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db import init_db
from db.models import NewGameData
from db.records import Deck, Player

from .repository import RepositoryDep


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


@app.post("/game")
def create_game(repository: RepositoryDep, game_data: NewGameData):
    # Ensure all players exist
    player_ids = [s.player_id for s in game_data.selected_decks]
    if len(player_ids) != len(set(player_ids)):
        raise ValueError("Duplicate Player ids")
    # Ensure all decks exist
    deck_ids = [s.deck_id for s in game_data.selected_decks]
    if len(deck_ids) != len(set(deck_ids)):
        raise ValueError("Duplicate Deck ids")
    # Build new Game
    game = repository.create_game(game_data.selected_decks)
    return game.id


@app.get("/games")
def get_games(repository: RepositoryDep):
    games = repository.get_games()
    return {g.id: g for g in games}
