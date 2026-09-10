from enum import Enum

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

__all__ = [
    "CamelBaseModel",
    "DeckHealth",
    "DeckPlayerSelection",
    "GameStatus",
]


class CamelBaseModel(BaseModel):
    """Base for anything that crosses the API boundary.

    Records deliberately do not inherit this — they are snake_case persistence
    objects. It is shared by the outward-facing schemas in `backend.schemas` and
    by the value types below, which appear on both sides of the boundary.
    """

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class GameStatus(str, Enum):
    ACTIVE = "active"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class DeckHealth(CamelBaseModel):
    """Per-deck live state. Stored as JSON on `Game.state`, served as-is by the API.

    The camel aliases only affect serialisation with `by_alias=True`, which is what
    FastAPI's `response_model` does. `pydantic_json` dumps without it, so the column
    keeps its snake_case keys and existing rows still parse.
    """

    model_config = ConfigDict(frozen=True)
    deck_id: int
    health: int = Field(default=40)
    commander: dict[int, int] = Field(default_factory=dict)
    poison: int = Field(default=0)


class DeckPlayerSelection(BaseModel):
    """A deck/player pairing, as the repository accepts it. Not outward-facing."""

    deck_id: int
    player_id: int
