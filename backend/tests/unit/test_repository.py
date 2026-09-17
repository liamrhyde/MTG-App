import pytest
from sqlmodel import Session, select

from backend.repository import Repository
from db.models import DeckHealthChange, DeckPlayerSelection, GameStateChange, GameStatus
from db.records import (
    DeckGameRecord,
    DeckRecord,
    GameRecord,
    GameTurnRecord,
    PlayerRecord,
    TurnEventRecord,
)


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


class TestApplyGameStateChange:
    def _make_game(
        self, session: Session, repository: Repository
    ) -> tuple[int, int, int]:
        player_1 = PlayerRecord(name="Alice")
        player_2 = PlayerRecord(name="Bob")
        session.add(player_1)
        session.add(player_2)
        session.commit()
        session.refresh(player_1)
        session.refresh(player_2)
        assert player_1.id is not None
        assert player_2.id is not None

        deck_1 = DeckRecord(name="Mono Red", owner_id=player_1.id)
        deck_2 = DeckRecord(name="Mono Blue", owner_id=player_2.id)
        session.add(deck_1)
        session.add(deck_2)
        session.commit()
        session.refresh(deck_1)
        session.refresh(deck_2)
        assert deck_1.id is not None
        assert deck_2.id is not None

        game = repository.create_game(
            [
                DeckPlayerSelection(deck_id=deck_1.id, player_id=player_1.id),
                DeckPlayerSelection(deck_id=deck_2.id, player_id=player_2.id),
            ]
        )
        assert game.id is not None

        return game.id, deck_1.id, deck_2.id

    def test_applies_health_poison_and_commander_deltas(
        self, session: Session, repository: Repository
    ):
        game_id, deck_1_id, deck_2_id = self._make_game(session, repository)

        change = GameStateChange(
            source_deck=deck_1_id,
            targets={deck_2_id: DeckHealthChange(health=-3, poison=1, commander=3)},
        )

        result = repository.apply_game_state_change(game_id, change)

        assert result is not None
        game, turn = result
        assert turn.id is not None
        assert game.state[deck_2_id].health == 37
        assert game.state[deck_2_id].poison == 1
        assert game.state[deck_2_id].commander == {deck_1_id: 3}
        # Untouched deck is unaffected
        assert game.state[deck_1_id].health == 40

    def test_commander_damage_accumulates_across_calls(
        self, session: Session, repository: Repository
    ):
        game_id, deck_1_id, deck_2_id = self._make_game(session, repository)

        change = GameStateChange(
            source_deck=deck_1_id,
            targets={deck_2_id: DeckHealthChange(commander=3)},
        )
        repository.apply_game_state_change(game_id, change)
        result = repository.apply_game_state_change(game_id, change)

        assert result is not None
        game, _turn = result
        assert game.state[deck_2_id].commander == {deck_1_id: 6}

    def test_self_targeting_is_allowed(self, session: Session, repository: Repository):
        game_id, deck_1_id, _ = self._make_game(session, repository)

        change = GameStateChange(
            source_deck=deck_1_id,
            targets={deck_1_id: DeckHealthChange(health=-1, poison=1)},
        )

        result = repository.apply_game_state_change(game_id, change)

        assert result is not None
        game, _turn = result
        assert game.state[deck_1_id].health == 39
        assert game.state[deck_1_id].poison == 1

    def test_returns_none_for_missing_game(self, repository: Repository):
        change = GameStateChange(source_deck=1, targets={})
        assert repository.apply_game_state_change(999, change) is None

    def test_raises_for_unknown_target_deck_id(
        self, session: Session, repository: Repository
    ):
        game_id, deck_1_id, _ = self._make_game(session, repository)

        change = GameStateChange(
            source_deck=deck_1_id,
            targets={999: DeckHealthChange(health=-1)},
        )

        with pytest.raises(ValueError):
            repository.apply_game_state_change(game_id, change)

    def test_raises_for_unknown_source_deck_id(
        self, session: Session, repository: Repository
    ):
        game_id, _, deck_2_id = self._make_game(session, repository)

        change = GameStateChange(
            source_deck=999,
            targets={deck_2_id: DeckHealthChange(health=-1)},
        )

        with pytest.raises(ValueError):
            repository.apply_game_state_change(game_id, change)


class TestRecordGameTurn:
    def _make_game(
        self, session: Session, repository: Repository
    ) -> tuple[int, int, int]:
        player_1 = PlayerRecord(name="Alice")
        player_2 = PlayerRecord(name="Bob")
        session.add(player_1)
        session.add(player_2)
        session.commit()
        session.refresh(player_1)
        session.refresh(player_2)
        assert player_1.id is not None
        assert player_2.id is not None

        deck_1 = DeckRecord(name="Mono Red", owner_id=player_1.id)
        deck_2 = DeckRecord(name="Mono Blue", owner_id=player_2.id)
        session.add(deck_1)
        session.add(deck_2)
        session.commit()
        session.refresh(deck_1)
        session.refresh(deck_2)
        assert deck_1.id is not None
        assert deck_2.id is not None

        game = repository.create_game(
            [
                DeckPlayerSelection(deck_id=deck_1.id, player_id=player_1.id),
                DeckPlayerSelection(deck_id=deck_2.id, player_id=player_2.id),
            ]
        )
        assert game.id is not None

        return game.id, deck_1.id, deck_2.id

    def test_decomposes_change_into_turn_and_events(
        self, session: Session, repository: Repository
    ):
        game_id, deck_1_id, deck_2_id = self._make_game(session, repository)

        change = GameStateChange(
            source_deck=deck_1_id,
            targets={deck_2_id: DeckHealthChange(health=-5, poison=2, commander=3)},
        )

        repository.apply_game_state_change(game_id, change)

        turns = session.exec(select(GameTurnRecord)).all()
        assert len(turns) == 1
        turn = turns[0]
        assert turn.game_id == game_id
        assert turn.source.deck_id == deck_1_id
        assert turn.state_change == change

        events = session.exec(
            select(TurnEventRecord).where(TurnEventRecord.turn_id == turn.id)
        ).all()
        assert len(events) == 1
        event = events[0]
        assert event.source_deck.deck_id == deck_1_id
        assert event.target_deck.deck_id == deck_2_id
        assert event.damage == 5
        assert event.poison_damage == 2
        assert event.commander_damage == 3

    def test_decomposes_change_into_one_event_per_target(
        self, session: Session, repository: Repository
    ):
        game_id, deck_1_id, deck_2_id = self._make_game(session, repository)

        change = GameStateChange(
            source_deck=deck_1_id,
            targets={
                deck_1_id: DeckHealthChange(health=-1),
                deck_2_id: DeckHealthChange(health=-2),
            },
        )

        repository.apply_game_state_change(game_id, change)

        turns = session.exec(select(GameTurnRecord)).all()
        assert len(turns) == 1

        events = session.exec(
            select(TurnEventRecord).where(TurnEventRecord.turn_id == turns[0].id)
        ).all()
        assert len(events) == 2
        by_target = {e.target_deck.deck_id: e for e in events}
        assert by_target[deck_1_id].damage == 1
        assert by_target[deck_2_id].damage == 2

    def test_elimination_flagged_on_lethal_health(
        self, session: Session, repository: Repository
    ):
        game_id, deck_1_id, deck_2_id = self._make_game(session, repository)

        change = GameStateChange(
            source_deck=deck_1_id,
            targets={deck_2_id: DeckHealthChange(health=-41)},
        )
        repository.apply_game_state_change(game_id, change)

        event = session.exec(select(TurnEventRecord)).one()
        assert event.is_elimination is True

    def test_elimination_flagged_on_lethal_poison(
        self, session: Session, repository: Repository
    ):
        game_id, deck_1_id, deck_2_id = self._make_game(session, repository)

        change = GameStateChange(
            source_deck=deck_1_id,
            targets={deck_2_id: DeckHealthChange(poison=11)},
        )
        repository.apply_game_state_change(game_id, change)

        event = session.exec(select(TurnEventRecord)).one()
        assert event.is_elimination is True

    def test_elimination_flagged_on_lethal_commander_damage(
        self, session: Session, repository: Repository
    ):
        game_id, deck_1_id, deck_2_id = self._make_game(session, repository)

        change = GameStateChange(
            source_deck=deck_1_id,
            targets={deck_2_id: DeckHealthChange(commander=21)},
        )
        repository.apply_game_state_change(game_id, change)

        event = session.exec(select(TurnEventRecord)).one()
        assert event.is_elimination is True

    def test_elimination_not_flagged_below_thresholds(
        self, session: Session, repository: Repository
    ):
        game_id, deck_1_id, deck_2_id = self._make_game(session, repository)

        change = GameStateChange(
            source_deck=deck_1_id,
            targets={deck_2_id: DeckHealthChange(health=0, poison=10, commander=20)},
        )
        repository.apply_game_state_change(game_id, change)

        event = session.exec(select(TurnEventRecord)).one()
        assert event.is_elimination is False

    def _deck_game(
        self, session: Session, game_id: int, deck_id: int
    ) -> DeckGameRecord:
        return session.exec(
            select(DeckGameRecord).where(
                DeckGameRecord.game_id == game_id, DeckGameRecord.deck_id == deck_id
            )
        ).one()

    def test_updates_damage_out_on_source_and_damage_in_on_target(
        self, session: Session, repository: Repository
    ):
        game_id, deck_1_id, deck_2_id = self._make_game(session, repository)

        change = GameStateChange(
            source_deck=deck_1_id,
            targets={deck_2_id: DeckHealthChange(health=-5)},
        )
        repository.apply_game_state_change(game_id, change)

        source = self._deck_game(session, game_id, deck_1_id)
        target = self._deck_game(session, game_id, deck_2_id)
        assert source.damage_out == 5
        assert source.damage_in is None
        assert target.damage_in == 5
        assert target.damage_out is None

    def test_damage_stats_accumulate_across_multiple_turns(
        self, session: Session, repository: Repository
    ):
        game_id, deck_1_id, deck_2_id = self._make_game(session, repository)

        change = GameStateChange(
            source_deck=deck_1_id,
            targets={deck_2_id: DeckHealthChange(health=-5)},
        )
        repository.apply_game_state_change(game_id, change)
        repository.apply_game_state_change(game_id, change)

        source = self._deck_game(session, game_id, deck_1_id)
        target = self._deck_game(session, game_id, deck_2_id)
        assert source.damage_out == 10
        assert target.damage_in == 10

    def test_damage_stats_split_across_multiple_targets(
        self, session: Session, repository: Repository
    ):
        game_id, deck_1_id, deck_2_id = self._make_game(session, repository)

        change = GameStateChange(
            source_deck=deck_1_id,
            targets={
                deck_1_id: DeckHealthChange(health=-1),
                deck_2_id: DeckHealthChange(health=-2),
            },
        )
        repository.apply_game_state_change(game_id, change)

        source = self._deck_game(session, game_id, deck_1_id)
        target = self._deck_game(session, game_id, deck_2_id)
        # Source deck both deals damage and self-targets, so damage_out
        # covers both events, while damage_in only covers the self-hit.
        assert source.damage_out == 3
        assert source.damage_in == 1
        assert target.damage_in == 2

    def test_eliminations_increment_on_source_deck(
        self, session: Session, repository: Repository
    ):
        game_id, deck_1_id, deck_2_id = self._make_game(session, repository)

        change = GameStateChange(
            source_deck=deck_1_id,
            targets={deck_2_id: DeckHealthChange(health=-41)},
        )
        repository.apply_game_state_change(game_id, change)

        source = self._deck_game(session, game_id, deck_1_id)
        target = self._deck_game(session, game_id, deck_2_id)
        assert source.eliminations == 1
        assert target.eliminations is None

    def test_eliminations_do_not_increment_below_threshold(
        self, session: Session, repository: Repository
    ):
        game_id, deck_1_id, deck_2_id = self._make_game(session, repository)

        change = GameStateChange(
            source_deck=deck_1_id,
            targets={deck_2_id: DeckHealthChange(health=-1)},
        )
        repository.apply_game_state_change(game_id, change)

        source = self._deck_game(session, game_id, deck_1_id)
        assert source.eliminations is None

    def test_eliminations_accumulate_across_multiple_kills(
        self, session: Session, repository: Repository
    ):
        game_id, deck_1_id, deck_2_id = self._make_game(session, repository)

        change = GameStateChange(
            source_deck=deck_1_id,
            targets={deck_2_id: DeckHealthChange(health=-41)},
        )
        repository.apply_game_state_change(game_id, change)
        repository.apply_game_state_change(game_id, change)

        source = self._deck_game(session, game_id, deck_1_id)
        assert source.eliminations == 2
