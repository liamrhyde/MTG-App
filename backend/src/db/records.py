from sqlalchemy import JSON, Column
from sqlmodel import Relationship, SQLModel, Field

from db.models import GameStatus, PlayerHealth


__all__ = ["Player", "Deck", "Game", "DeckGames"]


class Player(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    decks: list["Deck"] = Relationship(back_populates="owner")


class Deck(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    player_id: int = Field(foreign_key="player.id")
    owner: Player = Relationship(back_populates="decks")


class Game(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    status: GameStatus = Field(default=GameStatus.ACTIVE, index=True)
    player_count: int | None

    state: dict[str, PlayerHealth] = Field(default_factory=dict, sa_column=Column(JSON))

    # TODO: Add 'events' model


class DeckGames(SQLModel, table=True):
    game_id: int = Field(foreign_key="game.id", primary_key=True)
    deck_id: int = Field(foreign_key="deck.id", primary_key=True)
    player_id: int = Field(foreign_key="player.id")

    # Game End Stats
    position: int | None = Field(default=None)
    eliminations: int | None = Field(default=None)
    damage_out: int | None = Field(default=None)
    damage_in: int | None = Field(default=None)
