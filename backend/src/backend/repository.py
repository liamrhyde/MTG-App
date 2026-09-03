from typing import Annotated

from fastapi import Depends
from sqlmodel import Session, select

from db import SessionDep
from db.records import Deck, Game, Player


class Repository:
    def __init__(self, session: Session):
        self.session = session

    def commit(self):
        written = [*self.session.new, *self.session.dirty]
        self.session.commit()
        for instance in written:
            self.session.refresh(instance)

    def get_player(self, player_id: int):
        return self.session.get(Player, player_id)

    def get_players(self):
        return self.session.exec(select(Player)).all()

    def create_player(self, player: Player):
        self.session.add(player)
        self.commit()
        return player

    def get_deck(self, deck_id: int):
        return self.session.get(Deck, deck_id)

    def get_decks(self):
        return self.session.exec(select(Deck)).all()

    def create_deck(self, deck: Deck):
        self.session.add(deck)
        self.commit()
        return deck

    def get_game(self, game_id: int):
        return self.session.get(Game, game_id)

    def get_games(self):
        return self.session.exec(select(Game)).all()


def get_repository(session: SessionDep):
    yield Repository(session)


RepositoryDep = Annotated[Repository, Depends(get_repository)]
