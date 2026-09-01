from sqlmodel import select
from db.records import Deck
from typing import Annotated

from db import SessionDep
from db.records import Player, Game
from fastapi import Depends
from sqlmodel import Session


class Repository:
    def __init__(self, session: Session):
        self.session = session

    def commit(self):
        self.session.commit()

    def get_player(self, player_id: int):
        return self.session.get(Player, player_id)

    def get_players(self):
        return self.session.exec(select(Player)).all()

    def create_player(self, player: Player):
        self.session.add(player)
        self.session.commit()
        self.session.refresh(player)
        return player

    def get_deck(self, deck_id: int):
        return self.session.get(Deck, deck_id)

    def get_decks(self):
        return self.session.exec(select(Deck)).all()

    def get_game(self, game_id: int):
        return self.session.get(Game, game_id)

    def get_games(self):
        return self.session.exec(select(Game)).all()


def get_repository(session: SessionDep):
    yield Repository(session)


RepositoryDep = Annotated[Repository, Depends(get_repository)]
