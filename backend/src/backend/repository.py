from typing import Annotated

from db import SessionDep
from db.records import Player
from fastapi import Depends
from sqlmodel import Session


class Repository:
    def __init__(self, session: Session):
        self.session = session


def get_repository(session: SessionDep):
    yield Repository(session)


RepositoryDep = Annotated[Repository, Depends(get_repository)]
