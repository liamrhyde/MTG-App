from db.records import Deck
from typing import Annotated

from db import SessionDep
from db.records import Player
from fastapi import Depends
from sqlmodel import Session


class Repository:
    def __init__(self, session: Session):
        self.session = session

    def get_player(self, player_id: int):
        return self.session.get(Player, player_id)


def get_repository(session: SessionDep):
    yield Repository(session)


RepositoryDep = Annotated[Repository, Depends(get_repository)]
