from backend.repository import Repository, get_repository
from db.records import Player


class TestGetPlayer:
    def test_returns_existing_player(self, session, repository):
        player = Player(name="Alice")
        session.add(player)
        session.commit()

        result = repository.get_player(player.id)

        assert result is not None
        assert result.id == player.id
        assert result.name == player.name

    def test_returns_none_for_missing_id(self, repository):
        assert repository.get_player(999) is None
