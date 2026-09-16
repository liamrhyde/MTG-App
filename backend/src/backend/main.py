from contextlib import asynccontextmanager

from fastapi import (
    BackgroundTasks,
    FastAPI,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
)
from fastapi.middleware.cors import CORSMiddleware

from backend.realtime import ConnectionManager
from backend.schemas import (
    Deck,
    DeckCreate,
    Game,
    GameDetail,
    GameMember,
    NewGameData,
    Player,
    PlayerCreate,
)
from db import init_db
from db.models import DeckHealth, DeckPlayerSelection, GameStateChange
from db.records import DeckRecord, PlayerRecord

from .repository import RepositoryDep

ALLOWED_ORIGINS = ["http://localhost:5173"]  # Vite dev server


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    app.state.connection_manager = ConnectionManager()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
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


@app.get("/game/{game_id}", response_model=GameDetail)
def get_game_data(repository: RepositoryDep, game_id: int):
    game = repository.get_game(game_id)
    if not game or game.id is None:
        raise HTTPException(status_code=404, detail="Game not found")
    game_members_by_id = {
        m.deck_id: GameMember(
            deck_id=m.deck_id, deck_name=m.deck.name, player_name=m.player.name
        )
        for m in game.game_members
    }
    return GameDetail(game_id=game.id, game_members=game_members_by_id)


@app.get("/game/{game_id}/state", response_model=dict[int, DeckHealth])
def get_game_state(repository: RepositoryDep, game_id: int):
    game = repository.get_game(game_id)
    if not game or game.id is None:
        raise HTTPException(status_code=404, detail="Game not found")
    return game.state


@app.websocket("/ws/game/{game_id}")
async def game_socket(websocket: WebSocket, game_id: int):
    if websocket.headers.get("origin") not in ALLOWED_ORIGINS:
        await websocket.close(code=1008)
        return
    manager: ConnectionManager = websocket.app.state.connection_manager
    await manager.connect(game_id, websocket)
    try:
        while True:
            await websocket.receive_text()  # read-only subscriber; ignore content
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(game_id, websocket)


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


@app.patch("/game/{game_id}/state", response_model=dict[int, DeckHealth])
def update_game_state(
    repository: RepositoryDep,
    game_id: int,
    change: GameStateChange,
    background_tasks: BackgroundTasks,
):
    game = repository.apply_game_state_change(game_id, change)
    if game is None:
        raise HTTPException(status_code=404, detail="Game not found")
    background_tasks.add_task(
        app.state.connection_manager.broadcast,
        game_id,
        {
            "type": "gameStateChanged",
            "gameId": game_id,
            "gameState": {
                deck_id: health.model_dump(by_alias=True)
                for deck_id, health in game.state.items()
            },
            "change": change.model_dump(by_alias=True),
        },
    )
    return game.state
