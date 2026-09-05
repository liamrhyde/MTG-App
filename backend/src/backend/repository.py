from collections.abc import Sequence
from typing import Annotated

from fastapi import Depends
from sqlmodel import Session, col, select

from db import SessionDep
from db.models import NewGameSelection
from db.records import Deck, DeckGame, Game, Player


class Repository:
    def __init__(self, session: Session):
        self.session = session

    def commit(self):
        written = [*self.session.new, *self.session.dirty]
        self.session.commit()
        for instance in written:
            self.session.refresh(instance)

    def get_player(self, player_id: int):
        return self.session.get(Player, player_id)

    def get_players(self, ids: Sequence[int] | None = None):
        query = select(Player)
        if ids:
            query = query.where(col(Player.id).in_(ids))
        players = self.session.exec(query).all()
        if ids is not None:
            missing = set(ids) - {p.id for p in players}
            if missing:
                raise ValueError(f"Players not found: {sorted(missing)}")
        return players

    def create_player(self, player: Player):
        self.session.add(player)
        self.commit()
        return player

    def get_deck(self, deck_id: int):
        return self.session.get(Deck, deck_id)

    def get_decks(self, ids: Sequence[int] | None = None):
        query = select(Deck)
        if ids:
            query = query.where(col(Deck.id).in_(ids))
        decks = self.session.exec(query).all()
        if ids is not None:
            missing = set(ids) - {d.id for d in decks}
            if missing:
                raise ValueError(f"Decks not found: {sorted(missing)}")
        return decks

    def create_deck(self, deck: Deck):
        self.session.add(deck)
        self.commit()
        return deck

    def get_game(self, game_id: int):
        return self.session.get(Game, game_id)

    def create_game(self, game_selection: Sequence[NewGameSelection]):
        deck_ids = [s.deck_id for s in game_selection]
        decks_by_id = {d.id: d for d in self.get_decks(deck_ids)}

        player_ids = [s.player_id for s in game_selection]
        players_by_id = {p.id: p for p in self.get_players(player_ids)}

        game_models = [
            (decks_by_id[s.deck_id], players_by_id[s.player_id]) for s in game_selection
        ]

        game = Game(player_count=len(game_selection))
        game.init_game_state(deck_ids)

        for deck, player in game_models:
            self.create_deck_game(game, deck, player)

        self.session.add(game)
        self.commit()
        return game

    def create_deck_game(self, game: Game, deck: Deck, player: Player):
        return self.session.add(DeckGame(game=game, deck=deck, player=player))

    def get_games(self):
        return self.session.exec(select(Game)).all()


def get_repository(session: SessionDep):
    yield Repository(session)


RepositoryDep = Annotated[Repository, Depends(get_repository)]
