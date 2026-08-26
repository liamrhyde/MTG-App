from sqlmodel import Column, DateTime, Field, func, SQLModel
from datetime import datetime


class _StampedRecord(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(sa_column=Column(DateTime, server_default=func.now()))


class TestExpireOnCommit:
    def test_server_default_populated_after_commit_without_refresh(self, session):
        record = _StampedRecord()
        session.add(record)
        session.commit()

        assert record.created_at is not None
