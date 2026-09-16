"""
SQLModel internally defines __tablename__ for sqlalchemy
Adding ignore-errors to prevent flagging for manual table naming
"""
# pyrefly: ignore-errors[bad-override]

from sqlmodel import Field, Relationship, SQLModel

from db.db_utils import pydantic_json
from db.models import DeckHealth, GameStateChange, GameStatus

__all__ = [
    "DeckGameRecord",
    "DeckRecord",
    "GameRecord",
    "GameTurnRecord",
    "PlayerRecord",
    "TurnEventRecord",
]


class PlayerRecord(SQLModel, table=True):
    __tablename__ = "player"

    id: int | None = Field(default=None, primary_key=True)
    name: str

    decks: list["DeckRecord"] = Relationship(back_populates="owner")
    games_played: list["DeckGameRecord"] = Relationship(back_populates="player")


class DeckRecord(SQLModel, table=True):
    __tablename__ = "deck"

    id: int | None = Field(default=None, primary_key=True)
    name: str
    owner_id: int = Field(foreign_key="player.id")

    owner: PlayerRecord = Relationship(back_populates="decks")
    deck_games: list["DeckGameRecord"] = Relationship(back_populates="deck")


class GameRecord(SQLModel, table=True):
    __tablename__ = "game"

    id: int | None = Field(default=None, primary_key=True)
    status: GameStatus = Field(default=GameStatus.ACTIVE, index=True)
    player_count: int | None = Field(default=None)

    state: dict[int, DeckHealth] = Field(
        default_factory=dict, sa_type=pydantic_json(dict[int, DeckHealth])
    )

    game_members: list["DeckGameRecord"] = Relationship(back_populates="game")

    game_turns: list["GameTurnRecord"] = Relationship(back_populates="game")

    def init_game_state(self, deck_ids: list[int]):
        self.state = {d_id: DeckHealth(deck_id=d_id) for d_id in deck_ids}

    def apply_state_change(self, change: GameStateChange) -> None:
        referenced_ids = {change.source_deck, *change.targets}
        missing = referenced_ids - set(self.state)
        if missing:
            raise ValueError(f"Decks not found in game state: {sorted(missing)}")

        new_state = dict(self.state)
        for target_id, delta in change.targets.items():
            current = new_state[target_id]
            new_commander = dict(current.commander)
            new_commander[change.source_deck] = (
                new_commander.get(change.source_deck, 0) + delta.commander
            )
            new_state[target_id] = current.model_copy(
                update={
                    "health": current.health + delta.health,
                    "poison": current.poison + delta.poison,
                    "commander": new_commander,
                }
            )

        self.state = new_state


class DeckGameRecord(SQLModel, table=True):
    __tablename__ = "deckgame"

    id: int | None = Field(default=None, primary_key=True)
    game_id: int = Field(foreign_key="game.id")
    deck_id: int = Field(foreign_key="deck.id")
    player_id: int = Field(foreign_key="player.id")

    game: GameRecord = Relationship(back_populates="game_members")
    deck: DeckRecord = Relationship(back_populates="deck_games")
    player: PlayerRecord = Relationship(back_populates="games_played")

    # Game End Stats
    position: int | None = Field(default=None)
    eliminations: int | None = Field(default=None)
    damage_out: int | None = Field(default=None)
    damage_in: int | None = Field(default=None)


class GameTurnRecord(SQLModel, table=True):
    __tablename__ = "gameturn"

    id: int | None = Field(default=None, primary_key=True)
    game_id: int = Field(foreign_key="game.id")
    source_id: int = Field(foreign_key="deckgame.id")

    state_change: GameStateChange = Field(sa_type=pydantic_json(GameStateChange))

    game: GameRecord = Relationship(back_populates="game_turns")
    source: DeckGameRecord = Relationship()
    events: list["TurnEventRecord"] = Relationship(back_populates="turn")


class TurnEventRecord(SQLModel, table=True):
    __tablename__ = "turnevent"

    id: int | None = Field(default=None, primary_key=True)
    turn_id: int = Field(foreign_key="gameturn.id")
    source_deck_id: int = Field(foreign_key="deckgame.id")
    target_deck_id: int = Field(foreign_key="deckgame.id")

    damage: int = Field(default=0)
    commander_damage: int = Field(default=0)
    poison_damage: int = Field(default=0)
    is_elimination: bool = Field(default=False)

    turn: GameTurnRecord = Relationship(back_populates="events")
    source_deck: DeckGameRecord = Relationship(
        sa_relationship_kwargs={"foreign_keys": "TurnEventRecord.source_deck_id"}
    )
    target_deck: DeckGameRecord = Relationship(
        sa_relationship_kwargs={"foreign_keys": "TurnEventRecord.target_deck_id"}
    )
