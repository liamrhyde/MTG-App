from sqlmodel import Session
from backend.repository import Repository, get_repository
from db.records import Player


class TestGetPlayer:
    def test_returns_existing_player(self, session: Session, repository: Repository):
        player = Player(name="Alice")
        session.add(player)
        session.commit()
        session.refresh(player)

        assert player.id is not None
        result = repository.get_player(player.id)

        assert result is not None
        assert result.id == player.id
        assert result.name == player.name

    def test_returns_none_for_missing_id(self, repository):
        assert repository.get_player(999) is None


class TestGetPlayers:
    def test_returns_all_players(self, session: Session, repository: Repository):
        player_1 = Player(name="Alice")
        player_2 = Player(name="Bob")
        session.add(player_1)
        session.add(player_2)
        session.commit()

        result = repository.get_players()
        assert result is not None
        assert len(result) == 2
        for p in [player_1, player_2]:
            assert p in result
            assert p.id is not None

    def test_returns_empty_player_list(self, repository: Repository):
        result = repository.get_players()
        assert len(result) == 0
