from pydantic import ConfigDict
from pydantic.alias_generators import to_camel
from sqlalchemy import JSON, Column
from sqlmodel import Field, Relationship, SQLModel

from db.models import GameStatus, PlayerHealth

__all__ = ["Deck", "DeckGames", "Game", "Player"]


class CamelBaseModel(SQLModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class Player(CamelBaseModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    decks: list["Deck"] = Relationship(back_populates="owner")


class Deck(CamelBaseModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    owner_id: int = Field(foreign_key="player.id")
    owner: Player = Relationship(back_populates="decks")


class Game(CamelBaseModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    status: GameStatus = Field(default=GameStatus.ACTIVE, index=True)
    player_count: int | None = Field(default=None)

    state: dict[str, PlayerHealth] = Field(default_factory=dict, sa_column=Column(JSON))

    # TODO: Add 'events' model


class DeckGames(CamelBaseModel, table=True):
    game_id: int = Field(foreign_key="game.id", primary_key=True)
    deck_id: int = Field(foreign_key="deck.id", primary_key=True)
    player_id: int = Field(foreign_key="player.id")

    # Game End Stats
    position: int | None = Field(default=None)
    eliminations: int | None = Field(default=None)
    damage_out: int | None = Field(default=None)
    damage_in: int | None = Field(default=None)
