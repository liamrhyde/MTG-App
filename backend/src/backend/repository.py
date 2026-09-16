from collections.abc import Sequence
from typing import Annotated

from fastapi import Depends
from sqlmodel import Session, col, select

from db import SessionDep
from db.models import DeckPlayerSelection, GameStateChange
from db.records import (
    DeckGameRecord,
    DeckRecord,
    GameRecord,
    GameTurnRecord,
    PlayerRecord,
    TurnEventRecord,
)

COMMANDER_DAMAGE_LETHAL = 20
POISON_LETHAL = 10


class Repository:
    def __init__(self, session: Session):
        self.session = session

    def commit(self):
        written = [*self.session.new, *self.session.dirty]
        self.session.commit()
        for instance in written:
            self.session.refresh(instance)

    def get_player(self, player_id: int):
        return self.session.get(PlayerRecord, player_id)

    def get_players(self, ids: Sequence[int] | None = None):
        query = select(PlayerRecord)
        if ids:
            query = query.where(col(PlayerRecord.id).in_(ids))
        players = self.session.exec(query).all()
        if ids is not None:
            missing = set(ids) - {p.id for p in players}
            if missing:
                raise ValueError(f"Players not found: {sorted(missing)}")
        return players

    def create_player(self, player: PlayerRecord):
        self.session.add(player)
        self.commit()
        return player

    def get_deck(self, deck_id: int):
        return self.session.get(DeckRecord, deck_id)

    def get_decks(self, ids: Sequence[int] | None = None):
        query = select(DeckRecord)
        if ids:
            query = query.where(col(DeckRecord.id).in_(ids))
        decks = self.session.exec(query).all()
        if ids is not None:
            missing = set(ids) - {d.id for d in decks}
            if missing:
                raise ValueError(f"Decks not found: {sorted(missing)}")
        return decks

    def create_deck(self, deck: DeckRecord):
        self.session.add(deck)
        self.commit()
        return deck

    def get_game(self, game_id: int):
        return self.session.get(GameRecord, game_id)

    def create_game(self, game_selection: Sequence[DeckPlayerSelection]):
        deck_ids = [s.deck_id for s in game_selection]
        decks_by_id = {d.id: d for d in self.get_decks(deck_ids)}

        player_ids = [s.player_id for s in game_selection]
        players_by_id = {p.id: p for p in self.get_players(player_ids)}

        game_models = [
            (decks_by_id[s.deck_id], players_by_id[s.player_id]) for s in game_selection
        ]

        game = GameRecord(player_count=len(game_selection))
        game.init_game_state(deck_ids)

        for deck, player in game_models:
            self.create_deck_game(game, deck, player)

        self.session.add(game)
        self.commit()
        return game

    def create_deck_game(
        self, game: GameRecord, deck: DeckRecord, player: PlayerRecord
    ):
        return self.session.add(DeckGameRecord(game=game, deck=deck, player=player))

    def get_games(self):
        return self.session.exec(select(GameRecord)).all()

    def apply_game_state_change(
        self, game_id: int, change: GameStateChange
    ) -> GameRecord | None:
        game = self.get_game(game_id)
        if game is None:
            return None
        game.apply_state_change(change)
        self._record_game_turn(game, change)
        self.commit()
        return game

    def _record_game_turn(self, game: GameRecord, change: GameStateChange) -> None:
        deck_games_by_deck = {dg.deck_id: dg for dg in game.game_members}
        source_deck_game = deck_games_by_deck[change.source_deck]

        turn = GameTurnRecord(game=game, source=source_deck_game, state_change=change)

        for target_id, delta in change.targets.items():
            target_deck_game = deck_games_by_deck[target_id]
            target_state = game.state[target_id]
            target_commander_damage = target_state.commander.get(change.source_deck, 0)
            is_elimination = (
                target_state.health < 0
                or target_state.poison > POISON_LETHAL
                or target_commander_damage > COMMANDER_DAMAGE_LETHAL
            )
            damage = -delta.health

            self.session.add(
                TurnEventRecord(
                    turn=turn,
                    source_deck=source_deck_game,
                    target_deck=target_deck_game,
                    damage=damage,
                    commander_damage=delta.commander,
                    poison_damage=delta.poison,
                    is_elimination=is_elimination,
                )
            )

            source_deck_game.damage_out = (source_deck_game.damage_out or 0) + damage
            target_deck_game.damage_in = (target_deck_game.damage_in or 0) + damage
            if is_elimination:
                source_deck_game.eliminations = (source_deck_game.eliminations or 0) + 1

        self.session.add(turn)


def get_repository(session: SessionDep):
    yield Repository(session)


RepositoryDep = Annotated[Repository, Depends(get_repository)]
