import pytest
from sqlmodel import Session, select

from backend.repository import Repository
from db.models import DeckPlayerSelection, GameStatus
from db.records import DeckGameRecord, DeckRecord, GameRecord, PlayerRecord


class TestGetPlayer:
    def test_returns_existing_player(self, session: Session, repository: Repository):
        player = PlayerRecord(name="Alice")
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
        player_1 = PlayerRecord(name="Alice")
        player_2 = PlayerRecord(name="Bob")
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

    def test_returns_players_matching_ids(
        self, session: Session, repository: Repository
    ):
        player_1 = PlayerRecord(name="Alice")
        player_2 = PlayerRecord(name="Bob")
        session.add(player_1)
        session.add(player_2)
        session.commit()
        session.refresh(player_1)
        session.refresh(player_2)
        assert player_1.id is not None

        result = repository.get_players([player_1.id])

        assert len(result) == 1
        assert result[0].id == player_1.id

    def test_raises_for_missing_id(self, session: Session, repository: Repository):
        player = PlayerRecord(name="Alice")
        session.add(player)
        session.commit()
        session.refresh(player)
        assert player.id is not None

        with pytest.raises(ValueError):
            repository.get_players([player.id, 999])


class TestCreatePlayer:
    def test_create_player(self, repository: Repository, session: Session):
        player = PlayerRecord(name="Alfred")

        response = repository.create_player(player)

        assert response.id is not None
        assert response.name == "Alfred"

        raw_result = session.get(PlayerRecord, response.id)
        assert raw_result
        assert raw_result.name == "Alfred"


class TestCreateDeck:
    def test_create_deck(self, repository: Repository, session: Session):
        owner = PlayerRecord(name="Alfred")
        session.add(owner)
        session.commit()
        session.refresh(owner)
        assert owner.id is not None

        deck = DeckRecord(name="Mono Red", owner_id=owner.id)

        response = repository.create_deck(deck)

        assert response.id is not None
        assert response.name == "Mono Red"
        assert response.owner_id == owner.id

        raw_result = session.get(DeckRecord, response.id)
        assert raw_result
        assert raw_result.name == "Mono Red"
        assert raw_result.owner_id == owner.id


class TestGetDeck:
    def test_returns_existing_deck(self, session: Session, repository: Repository):
        owner = PlayerRecord(name="Alice")
        session.add(owner)
        session.commit()
        session.refresh(owner)
        assert owner.id is not None

        deck = DeckRecord(name="Mono Red", owner_id=owner.id)
        session.add(deck)
        session.commit()
        session.refresh(deck)

        assert deck.id is not None
        result = repository.get_deck(deck.id)

        assert result is not None
        assert result.id == deck.id
        assert result.owner_id == owner.id

    def test_returns_none_for_missing_id(self, repository: Repository):
        assert repository.get_deck(999) is None


class TestGetDecks:
    def test_returns_all_decks(self, session: Session, repository: Repository):
        owner = PlayerRecord(name="Alice")
        session.add(owner)
        session.commit()
        session.refresh(owner)
        assert owner.id is not None

        deck_1 = DeckRecord(name="Mono Red", owner_id=owner.id)
        deck_2 = DeckRecord(name="Mono Blue", owner_id=owner.id)
        session.add(deck_1)
        session.add(deck_2)
        session.commit()

        result = repository.get_decks()
        assert result is not None
        assert len(result) == 2
        for d in [deck_1, deck_2]:
            assert d in result
            assert d.id is not None

    def test_returns_empty_deck_list(self, repository: Repository):
        result = repository.get_decks()
        assert len(result) == 0

    def test_returns_decks_matching_ids(self, session: Session, repository: Repository):
        owner = PlayerRecord(name="Alice")
        session.add(owner)
        session.commit()
        session.refresh(owner)
        assert owner.id is not None

        deck_1 = DeckRecord(name="Mono Red", owner_id=owner.id)
        deck_2 = DeckRecord(name="Mono Blue", owner_id=owner.id)
        session.add(deck_1)
        session.add(deck_2)
        session.commit()
        session.refresh(deck_1)
        session.refresh(deck_2)
        assert deck_1.id is not None

        result = repository.get_decks([deck_1.id])

        assert len(result) == 1
        assert result[0].id == deck_1.id

    def test_raises_for_missing_id(self, session: Session, repository: Repository):
        owner = PlayerRecord(name="Alice")
        session.add(owner)
        session.commit()
        session.refresh(owner)
        assert owner.id is not None

        deck = DeckRecord(name="Mono Red", owner_id=owner.id)
        session.add(deck)
        session.commit()
        session.refresh(deck)
        assert deck.id is not None

        with pytest.raises(ValueError):
            repository.get_decks([deck.id, 999])


class TestCreateGame:
    def _make_player_and_deck(self, session: Session, player_name: str, deck_name: str):
        player = PlayerRecord(name=player_name)
        session.add(player)
        session.commit()
        session.refresh(player)
        assert player.id is not None

        deck = DeckRecord(name=deck_name, owner_id=player.id)
        session.add(deck)
        session.commit()
        session.refresh(deck)
        assert deck.id is not None

        return player, deck

    def test_creates_game_with_deck_games(
        self, session: Session, repository: Repository
    ):
        player_1, deck_1 = self._make_player_and_deck(session, "Alice", "Mono Red")
        player_2, deck_2 = self._make_player_and_deck(session, "Bob", "Mono Blue")
        assert player_1.id is not None
        assert player_2.id is not None
        assert deck_1.id is not None
        assert deck_2.id is not None

        selections = [
            DeckPlayerSelection(deck_id=deck_1.id, player_id=player_1.id),
            DeckPlayerSelection(deck_id=deck_2.id, player_id=player_2.id),
        ]

        game = repository.create_game(selections)

        assert game.id is not None
        assert game.player_count == 2
        assert set(game.state.keys()) == {deck_1.id, deck_2.id}

        deck_games = session.exec(
            select(DeckGameRecord).where(DeckGameRecord.game_id == game.id)
        ).all()
        assert len(deck_games) == 2

        by_deck_id = {dg.deck_id: dg for dg in deck_games}
        assert by_deck_id[deck_1.id].player_id == player_1.id
        assert by_deck_id[deck_2.id].player_id == player_2.id

    def test_raises_for_missing_player_id(
        self, session: Session, repository: Repository
    ):
        _, deck = self._make_player_and_deck(session, "Alice", "Mono Red")
        assert deck.id is not None

        selections = [DeckPlayerSelection(deck_id=deck.id, player_id=999)]

        with pytest.raises(ValueError):
            repository.create_game(selections)

    def test_raises_for_missing_deck_id(self, session: Session, repository: Repository):
        player, _ = self._make_player_and_deck(session, "Alice", "Mono Red")
        assert player.id is not None

        selections = [DeckPlayerSelection(deck_id=999, player_id=player.id)]

        with pytest.raises(ValueError):
            repository.create_game(selections)


class TestGetGame:
    def test_returns_existing_game(self, session: Session, repository: Repository):
        # TODO: Improve Game fixture
        game = GameRecord()

        session.add(game)
        session.commit()
        session.refresh(game)

        assert game.id is not None
        result = repository.get_game(game.id)

        assert result is not None
        assert result.id == game.id
        assert result.status == GameStatus.ACTIVE

    def test_returns_none_for_missing_id(self, repository: Repository):
        assert repository.get_game(999) is None


class TestGetGames:
    def test_returns_all_games(self, session: Session, repository: Repository):
        game_1 = GameRecord(player_count=4)
        game_2 = GameRecord(player_count=2, status=GameStatus.COMPLETED)
        session.add(game_1)
        session.add(game_2)
        session.commit()

        result = repository.get_games()
        assert result is not None
        assert len(result) == 2
        for g in [game_1, game_2]:
            assert g in result
            assert g.id is not None

    def test_returns_empty_game_list(self, repository: Repository):
        result = repository.get_games()
        assert len(result) == 0
