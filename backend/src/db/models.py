from enum import Enum

from pydantic import BaseModel, Field

__all__ = ["GameStatus", "PlayerHealth"]


class GameStatus(str, Enum):
    ACTIVE = "active"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class PlayerHealth(BaseModel):
    health: int = Field(default=40)
    commander: int = Field(default=0)
    poison: int = Field(default=0)
