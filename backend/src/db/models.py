from collections.abc import Sequence
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel
from sqlmodel import SQLModel

__all__ = [
    "CamelBaseModel",
    "DeckHealth",
    "GameStatus",
    "NewGameData",
    "NewGameSelection",
]


class CamelBaseModel(SQLModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class GameStatus(str, Enum):
    ACTIVE = "active"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class DeckHealth(BaseModel):
    model_config = ConfigDict(frozen=True)
    deck_id: int
    health: int = Field(default=40)
    commander: dict[int, int] = Field(default_factory=dict)
    poison: int = Field(default=0)


class NewGameSelection(CamelBaseModel):
    deck_id: int
    player_id: int


class NewGameData(CamelBaseModel):
    selected_decks: Sequence[NewGameSelection]
