from sqlmodel import Session
from backend.repository import Repository, get_repository
from db.models import GameStatus, PlayerHealth
from db.records import Deck, Game, Player


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


class TestCreatePlayer:
    def test_create_player(self, repository: Repository, session: Session):
        player = Player(name="Alfred")

        response = repository.create_player(player)

        assert response.id is not None
        assert response.name == "Alfred"

        raw_result = session.get(Player, response.id)
        assert raw_result
        assert raw_result.name == "Alfred"


class TestCreateDeck:
    def test_create_deck(self, repository: Repository, session: Session):
        player = Player(name="Alfred")
        session.add(player)
        session.commit()
        session.refresh(player)
        assert player.id is not None

        deck = Deck(name="Mono Red", player_id=player.id)

        response = repository.create_deck(deck)

        assert response.id is not None
        assert response.name == "Mono Red"
        assert response.player_id == player.id

        raw_result = session.get(Deck, response.id)
        assert raw_result
        assert raw_result.name == "Mono Red"
        assert raw_result.player_id == player.id


class TestGetDeck:
    def test_returns_existing_deck(self, session: Session, repository: Repository):
        player = Player(name="Alice")
        session.add(player)
        session.commit()
        session.refresh(player)
        assert player.id is not None

        deck = Deck(name="Mono Red", player_id=player.id)
        session.add(deck)
        session.commit()
        session.refresh(deck)

        assert deck.id is not None
        result = repository.get_deck(deck.id)

        assert result is not None
        assert result.id == deck.id
        assert result.player_id == player.id

    def test_returns_none_for_missing_id(self, repository: Repository):
        assert repository.get_deck(999) is None


class TestGetDecks:
    def test_returns_all_decks(self, session: Session, repository: Repository):
        player = Player(name="Alice")
        session.add(player)
        session.commit()
        session.refresh(player)
        assert player.id is not None

        deck_1 = Deck(name="Mono Red", player_id=player.id)
        deck_2 = Deck(name="Mono Blue", player_id=player.id)
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


class TestGetGame:
    def test_returns_existing_game(self, session: Session, repository: Repository):
        # TODO: Improve Game fixture
        game = Game()

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
        game_1 = Game(player_count=4)
        game_2 = Game(player_count=2, status=GameStatus.COMPLETED)
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
