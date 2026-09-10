from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from db.models import DeckHealth
from db.records import Deck, Player


class CamelBaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class GameMember(CamelBaseSchema):
    deck_id: int
    deck_name: Deck
    player_name: Player


class GameDataResponse(CamelBaseSchema):
    game_id: int
    game_members: dict[int, GameMember]
    game_state: dict[int, DeckHealth]
