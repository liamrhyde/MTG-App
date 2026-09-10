from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.schemas import (
    Deck,
    DeckCreate,
    Game,
    GameDataResponse,
    NewGameData,
    Player,
    PlayerCreate,
)
from db import init_db
from db.models import DeckPlayerSelection
from db.records import DeckRecord, PlayerRecord

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


@app.get("/player/{player_id}", response_model=Player)
def get_player(repository: RepositoryDep, player_id: int):
    return repository.get_player(player_id)


@app.get("/players", response_model=dict[int, Player])
def get_players(repository: RepositoryDep):
    players = repository.get_players()
    return {p.id: p for p in players}


@app.post("/player", response_model=Player)
def create_player(player: PlayerCreate, repository: RepositoryDep):
    return repository.create_player(PlayerRecord(**player.model_dump()))


@app.get("/deck/{deck_id}", response_model=Deck)
def get_deck(repository: RepositoryDep, deck_id: int):
    return repository.get_deck(deck_id)


@app.get("/decks", response_model=dict[int, Deck])
def get_decks(repository: RepositoryDep):
    decks = repository.get_decks()
    return {d.id: d for d in decks}


@app.post("/deck", response_model=Deck)
def create_deck(deck: DeckCreate, repository: RepositoryDep):
    return repository.create_deck(DeckRecord(**deck.model_dump()))


@app.get("/game/{game_id}", response_model=GameDataResponse)
def get_game_data(repository: RepositoryDep, game_id: int):
    game = repository.get_game(game_id)
    if not game or game.id is None:
        raise HTTPException(status_code=404, detail="Game not found")
    game_members_by_id = {m.deck_id: m for m in game.game_members}
    return GameDataResponse(
        game_id=game.id, game_members=game_members_by_id, game_state=game.state
    )


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
    selections = [
        DeckPlayerSelection(deck_id=s.deck_id, player_id=s.player_id)
        for s in game_data.selected_decks
    ]
    game = repository.create_game(selections)
    return game.id


@app.get("/games", response_model=dict[int, Game])
def get_games(repository: RepositoryDep):
    games = repository.get_games()
    return {g.id: g for g in games}
