import pytest
from backend.repository import Repository
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine


@pytest.fixture()
def test_engine():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    return engine


@pytest.fixture()
def session(test_engine):
    with Session(test_engine) as session:
        yield session


@pytest.fixture()
def repository(session):
    return Repository(session)
