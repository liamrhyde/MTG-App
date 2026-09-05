from collections.abc import Sequence
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel
from sqlmodel import SQLModel

__all__ = [
    "CamelBaseModel",
    "GameStatus",
    "NewGameData",
    "NewGameSelection",
    "PlayerHealth",
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


class PlayerHealth(BaseModel):
    model_config = ConfigDict(frozen=True)
    health: int = Field(default=40)
    commander: int = Field(default=0)
    poison: int = Field(default=0)


class NewGameSelection(CamelBaseModel):
    deck_id: int
    player_id: int


class NewGameData(CamelBaseModel):
    selected_decks: Sequence[NewGameSelection]
