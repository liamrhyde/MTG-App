from collections.abc import Sequence

from db.models import CamelBaseModel, DeckHealth, GameStatus

__all__ = [
    "Deck",
    "DeckCreate",
    "Game",
    "GameDataResponse",
    "GameMember",
    "NewGameData",
    "NewGameSelection",
    "Player",
    "PlayerCreate",
]


class Player(CamelBaseModel):
    id: int
    name: str


class PlayerCreate(CamelBaseModel):
    name: str


class Deck(CamelBaseModel):
    id: int
    name: str
    owner_id: int


class DeckCreate(CamelBaseModel):
    name: str
    owner_id: int


class Game(CamelBaseModel):
    id: int
    status: GameStatus
    player_count: int | None


class NewGameSelection(CamelBaseModel):
    deck_id: int
    player_id: int


class NewGameData(CamelBaseModel):
    selected_decks: Sequence[NewGameSelection]


class GameMember(CamelBaseModel):
    deck_id: int
    deck_name: str
    player_name: str


class GameDataResponse(CamelBaseModel):
    game_id: int
    game_members: dict[int, GameMember]
    game_state: dict[int, DeckHealth]
