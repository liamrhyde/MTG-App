from sqlmodel import Field, Relationship

from db.db_utils import pydantic_json
from db.models import CamelBaseModel, GameStatus, PlayerHealth

__all__ = ["Deck", "DeckGame", "Game", "Player"]


class Player(CamelBaseModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str

    decks: list["Deck"] = Relationship(back_populates="owner")
    games_played: list["DeckGame"] = Relationship(back_populates="player")


class Deck(CamelBaseModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    owner_id: int = Field(foreign_key="player.id")

    owner: Player = Relationship(back_populates="decks")
    deck_games: list["DeckGame"] = Relationship(back_populates="deck")


class Game(CamelBaseModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    status: GameStatus = Field(default=GameStatus.ACTIVE, index=True)
    player_count: int | None = Field(default=None)

    state: dict[int, PlayerHealth] = Field(
        default_factory=dict, sa_type=pydantic_json(dict[int, PlayerHealth])
    )

    deck_states: list["DeckGame"] = Relationship(back_populates="game")

    # TODO: Add 'events' model

    def init_game_state(self, deck_ids: list[int]):
        self.state = {d_id: PlayerHealth() for d_id in deck_ids}


class DeckGame(CamelBaseModel, table=True):
    game_id: int = Field(foreign_key="game.id", primary_key=True)
    deck_id: int = Field(foreign_key="deck.id", primary_key=True)
    player_id: int = Field(foreign_key="player.id")

    game: Game = Relationship(back_populates="deck_states")
    deck: Deck = Relationship(back_populates="deck_games")
    player: Player = Relationship(back_populates="games_played")

    # Game End Stats
    position: int | None = Field(default=None)
    eliminations: int | None = Field(default=None)
    damage_out: int | None = Field(default=None)
    damage_in: int | None = Field(default=None)
