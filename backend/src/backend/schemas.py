from collections.abc import Sequence
from typing import Generic, TypeVar

from sqlmodel import SQLModel
from typing_extensions import Self

from db.models import CamelBaseModel, DeckHealth, GameStatus
from db.records import DeckGameRecord, DeckRecord, GameRecord, PlayerRecord

__all__ = [
    "Deck",
    "DeckCreate",
    "Game",
    "GameDetail",
    "GameMember",
    "GameParticipant",
    "NewGameData",
    "NewGameSelection",
    "Player",
    "PlayerCreate",
    "RecordSchema",
]

R = TypeVar("R", bound=SQLModel)


class RecordSchema(CamelBaseModel, Generic[R]):
    """Base for schemas that are a direct projection of one record type.

    Subclasses name their source record as the type parameter, e.g.
    `class Player(RecordSchema[PlayerRecord])`, so `from_record` only accepts
    that record type. Fields are read off the record by name (`from_attributes`),
    so each schema field must exist as an attribute on the record.
    """

    @classmethod
    def from_record(cls, record: R) -> Self:
        return cls.model_validate(record)


class Player(RecordSchema[PlayerRecord]):
    id: int
    name: str


class PlayerCreate(CamelBaseModel):
    name: str


class Deck(RecordSchema[DeckRecord]):
    id: int
    name: str
    owner_id: int


class DeckCreate(CamelBaseModel):
    name: str
    owner_id: int


class GameParticipant(RecordSchema[DeckGameRecord]):
    deck_id: int
    player_id: int


class Game(RecordSchema[GameRecord]):
    id: int
    status: GameStatus
    player_count: int | None
    state: dict[int, DeckHealth]
    game_members: list[GameParticipant]


class NewGameSelection(CamelBaseModel):
    deck_id: int
    player_id: int


class NewGameData(CamelBaseModel):
    selected_decks: Sequence[NewGameSelection]


class GameMember(CamelBaseModel):
    deck_id: int
    deck_name: str
    player_name: str


class GameDetail(CamelBaseModel):
    game_id: int
    game_members: dict[int, GameMember]
