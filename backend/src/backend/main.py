from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from itertools import combinations
from pathlib import Path
from datetime import datetime
from typing import List, Optional
import csv
import shutil


# =========================
# FastAPI app
# =========================

app = FastAPI(
    title="MTG Elo Tracker API",
    description="API for tracking Magic the Gathering deck Elo, damage, eliminations and game history.",
    version="1.0.0"
)


# =========================
# File paths
# =========================

BASE_DIR = Path(__file__).parent
DB_DIR = BASE_DIR / "database"
BACKUP_DIR = DB_DIR / "backups"

PLAYERS_FILE = DB_DIR / "players.txt"
DECKS_FILE = DB_DIR / "decks.txt"
GAMES_FILE = DB_DIR / "games.txt"
PARTICIPANTS_FILE = DB_DIR / "game_participants.txt"
DAMAGE_FILE = DB_DIR / "damage_events.txt"
ELO_HISTORY_FILE = DB_DIR / "elo_history.txt"


# =========================
# Elo settings
# =========================

K_FACTOR = 32

WEIGHTS = {
    "placement": 0.7,
    "eliminations": 0.2,
    "damage": 0.1
}


# =========================
# Request models
# =========================

class ParticipantInput(BaseModel):
    deck_id: str
    placement: int
    eliminations: int = 0
    life_remaining: int = 0


class DamageInput(BaseModel):
    source_deck_id: str
    target_deck_id: str
    damage_amount: int


class GameInput(BaseModel):
    number_of_turns: int
    use_weighted_mode: bool = False
    participants: List[ParticipantInput]
    damage_events: List[DamageInput]


class DeckInput(BaseModel):
    deck_id: str
    player_id: str
    deck_name: str
    commander: str
    elo: int = 1500


# =========================
# Setup helpers
# =========================

def ensure_database_files_exist():
    DB_DIR.mkdir(parents=True, exist_ok=True)
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)

    files_and_headers = {
        PLAYERS_FILE: ["PlayerID", "PlayerName"],
        DECKS_FILE: ["DeckID", "PlayerID", "DeckName", "Commander", "ELO"],
        GAMES_FILE: ["GameID", "DatePlayed", "NumberOfTurns", "WinnerDeckID"],
        PARTICIPANTS_FILE: [
            "GameID",
            "DeckID",
            "Placement",
            "Eliminations",
            "LifeRemaining",
            "DamageDealt",
            "DamageTaken"
        ],
        DAMAGE_FILE: ["GameID", "SourceDeckID", "TargetDeckID", "DamageAmount"],
        ELO_HISTORY_FILE: ["GameID", "DeckID", "OldELO", "NewELO", "ELOChange"]
    }

    for file_path, headers in files_and_headers.items():
        if not file_path.exists():
            with open(file_path, "w", newline="") as file:
                writer = csv.DictWriter(file, fieldnames=headers)
                writer.writeheader()


@app.on_event("startup")
def startup_event():
    ensure_database_files_exist()


# =========================
# Generic file helpers
# =========================

def read_csv_file(file_path):
    with open(file_path, newline="") as file:
        reader = csv.DictReader(file)
        return list(reader)


def write_csv_file(file_path, fieldnames, rows):
    with open(file_path, "w", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def append_csv_row(file_path, fieldnames, row):
    with open(file_path, "a", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writerow(row)


def generate_game_id():
    return "G" + datetime.now().strftime("%Y%m%d_%H%M%S")


def backup_database():
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_subdir = BACKUP_DIR / timestamp
    backup_subdir.mkdir(parents=True, exist_ok=True)

    database_files = [
        PLAYERS_FILE,
        DECKS_FILE,
        GAMES_FILE,
        PARTICIPANTS_FILE,
        DAMAGE_FILE,
        ELO_HISTORY_FILE
    ]

    for file_path in database_files:
        if file_path.exists():
            shutil.copy2(file_path, backup_subdir / file_path.name)

    return str(backup_subdir)


# =========================
# Deck helpers
# =========================

def load_decks():
    decks = {}

    rows = read_csv_file(DECKS_FILE)

    for row in rows:
        deck_id = row["DeckID"]
        row["ELO"] = int(row["ELO"])
        decks[deck_id] = row

    return decks


def save_decks(decks):
    fieldnames = ["DeckID", "PlayerID", "DeckName", "Commander", "ELO"]

    rows = []

    for deck in decks.values():
        rows.append({
            "DeckID": deck["DeckID"],
            "PlayerID": deck["PlayerID"],
            "DeckName": deck["DeckName"],
            "Commander": deck["Commander"],
            "ELO": deck["ELO"]
        })

    write_csv_file(DECKS_FILE, fieldnames, rows)


def deck_exists(deck_id):
    decks = load_decks()
    return deck_id in decks


# =========================
# Elo functions
# =========================

def expected_score(rating_a, rating_b):
    return 1 / (1 + 10 ** ((rating_b - rating_a) / 400))


def calculate_performance_scores(placements, eliminations, damage_dealt):
    scores = {}

    max_elims = max(eliminations.values()) or 1
    total_damage = sum(damage_dealt.values()) or 1
    num_players = len(placements)

    for deck_id in placements:
        if num_players == 1:
            placement_score = 1
        else:
            placement_score = (num_players - placements[deck_id]) / (num_players - 1)

        elim_score = eliminations[deck_id] / max_elims
        damage_score = damage_dealt[deck_id] / total_damage

        scores[deck_id] = (
            WEIGHTS["placement"] * placement_score
            + WEIGHTS["eliminations"] * elim_score
            + WEIGHTS["damage"] * damage_score
        )

    return scores


def update_elo(ratings, placement_order, use_weighted_mode=False, scores=None, k=K_FACTOR):
    new_ratings = ratings.copy()
    rating_changes = {deck_id: 0 for deck_id in ratings}

    for winner, loser in combinations(placement_order, 2):
        ra = ratings[winner]
        rb = ratings[loser]

        ea = expected_score(ra, rb)
        eb = expected_score(rb, ra)

        if use_weighted_mode and scores is not None:
            sa = scores[winner]
            sb = scores[loser]

            change_winner = k * (sa - ea)
            change_loser = k * (sb - eb)
        else:
            change_winner = k * (1 - ea)
            change_loser = k * (0 - eb)

        rating_changes[winner] += change_winner
        rating_changes[loser] += change_loser

    for deck_id in ratings:
        new_ratings[deck_id] += round(rating_changes[deck_id])

    return new_ratings, rating_changes


# =========================
# Save game data
# =========================

def save_game(game_id, number_of_turns, winner_deck_id):
    append_csv_row(
        GAMES_FILE,
        ["GameID", "DatePlayed", "NumberOfTurns", "WinnerDeckID"],
        {
            "GameID": game_id,
            "DatePlayed": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "NumberOfTurns": number_of_turns,
            "WinnerDeckID": winner_deck_id
        }
    )


def save_participants(game_id, participants, damage_dealt, damage_taken):
    fieldnames = [
        "GameID",
        "DeckID",
        "Placement",
        "Eliminations",
        "LifeRemaining",
        "DamageDealt",
        "DamageTaken"
    ]

    for participant in participants:
        deck_id = participant.deck_id

        append_csv_row(
            PARTICIPANTS_FILE,
            fieldnames,
            {
                "GameID": game_id,
                "DeckID": deck_id,
                "Placement": participant.placement,
                "Eliminations": participant.eliminations,
                "LifeRemaining": participant.life_remaining,
                "DamageDealt": damage_dealt.get(deck_id, 0),
                "DamageTaken": damage_taken.get(deck_id, 0)
            }
        )


def save_damage_events(game_id, damage_events):
    fieldnames = ["GameID", "SourceDeckID", "TargetDeckID", "DamageAmount"]

    for event in damage_events:
        append_csv_row(
            DAMAGE_FILE,
            fieldnames,
            {
                "GameID": game_id,
                "SourceDeckID": event.source_deck_id,
                "TargetDeckID": event.target_deck_id,
                "DamageAmount": event.damage_amount
            }
        )


def save_elo_history(game_id, old_ratings, new_ratings):
    fieldnames = ["GameID", "DeckID", "OldELO", "NewELO", "ELOChange"]

    for deck_id in old_ratings:
        old_elo = old_ratings[deck_id]
        new_elo = new_ratings[deck_id]

        append_csv_row(
            ELO_HISTORY_FILE,
            fieldnames,
            {
                "GameID": game_id,
                "DeckID": deck_id,
                "OldELO": old_elo,
                "NewELO": new_elo,
                "ELOChange": new_elo - old_elo
            }
        )


# =========================
# API endpoints
# =========================

@app.get("/")
def root():
    return {
        "message": "MTG Elo Tracker API is running",
        "docs": "/docs"
    }


@app.get("/decks")
def get_decks():
    decks = load_decks()
    return list(decks.values())


@app.get("/leaderboard")
def get_leaderboard():
    decks = load_decks()

    leaderboard = sorted(
        decks.values(),
        key=lambda deck: deck["ELO"],
        reverse=True
    )

    return leaderboard


@app.post("/decks")
def add_deck(deck: DeckInput):
    decks = load_decks()

    if deck.deck_id in decks:
        raise HTTPException(status_code=400, detail="DeckID already exists")

    append_csv_row(
        DECKS_FILE,
        ["DeckID", "PlayerID", "DeckName", "Commander", "ELO"],
        {
            "DeckID": deck.deck_id,
            "PlayerID": deck.player_id,
            "DeckName": deck.deck_name,
            "Commander": deck.commander,
            "ELO": deck.elo
        }
    )

    return {
        "success": True,
        "message": "Deck added",
        "deck": deck
    }


@app.post("/games")
def submit_game(game: GameInput):
    decks = load_decks()

    if len(game.participants) < 2:
        raise HTTPException(status_code=400, detail="At least 2 participants are required")

    participant_deck_ids = [p.deck_id for p in game.participants]

    if len(participant_deck_ids) != len(set(participant_deck_ids)):
        raise HTTPException(status_code=400, detail="Duplicate deck found in participants")

    for deck_id in participant_deck_ids:
        if deck_id not in decks:
            raise HTTPException(status_code=404, detail=f"Deck not found: {deck_id}")

    for damage in game.damage_events:
        if damage.source_deck_id not in participant_deck_ids:
            raise HTTPException(
                status_code=400,
                detail=f"Source deck not in game: {damage.source_deck_id}"
            )

        if damage.target_deck_id not in participant_deck_ids:
            raise HTTPException(
                status_code=400,
                detail=f"Target deck not in game: {damage.target_deck_id}"
            )

        if damage.source_deck_id == damage.target_deck_id:
            raise HTTPException(
                status_code=400,
                detail="Source deck and target deck cannot be the same"
            )

        if damage.damage_amount < 0:
            raise HTTPException(
                status_code=400,
                detail="Damage amount cannot be negative"
            )

    placements = {}
    eliminations = {}

    for participant in game.participants:
        placements[participant.deck_id] = participant.placement
        eliminations[participant.deck_id] = participant.eliminations

    placement_values = list(placements.values())
    expected_places = list(range(1, len(game.participants) + 1))

    if sorted(placement_values) != expected_places:
        raise HTTPException(
            status_code=400,
            detail=f"Placements must be exactly {expected_places}"
        )

    placement_order = [
        deck_id for deck_id, place in sorted(
            placements.items(),
            key=lambda item: item[1]
        )
    ]

    winner_deck_id = placement_order[0]

    current_ratings = {
        deck_id: decks[deck_id]["ELO"]
        for deck_id in participant_deck_ids
    }

    damage_dealt = {deck_id: 0 for deck_id in participant_deck_ids}
    damage_taken = {deck_id: 0 for deck_id in participant_deck_ids}

    for damage in game.damage_events:
        damage_dealt[damage.source_deck_id] += damage.damage_amount
        damage_taken[damage.target_deck_id] += damage.damage_amount

    if game.use_weighted_mode:
        scores = calculate_performance_scores(
            placements,
            eliminations,
            damage_dealt
        )
    else:
        scores = None

    new_ratings, rating_changes = update_elo(
        current_ratings,
        placement_order,
        use_weighted_mode=game.use_weighted_mode,
        scores=scores
    )

    game_id = generate_game_id()

    backup_location = backup_database()

    save_game(game_id, game.number_of_turns, winner_deck_id)

    save_participants(
        game_id,
        game.participants,
        damage_dealt,
        damage_taken
    )

    save_damage_events(game_id, game.damage_events)

    save_elo_history(game_id, current_ratings, new_ratings)

    for deck_id, new_elo in new_ratings.items():
        decks[deck_id]["ELO"] = new_elo

    save_decks(decks)

    response_changes = {}

    for deck_id in new_ratings:
        response_changes[deck_id] = {
            "deck_name": decks[deck_id]["DeckName"],
            "old_elo": current_ratings[deck_id],
            "new_elo": new_ratings[deck_id],
            "elo_change": new_ratings[deck_id] - current_ratings[deck_id],
            "raw_change": round(rating_changes[deck_id], 2),
            "damage_dealt": damage_dealt[deck_id],
            "damage_taken": damage_taken[deck_id]
        }

    return {
        "success": True,
        "game_id": game_id,
        "winner_deck_id": winner_deck_id,
        "winner_deck_name": decks[winner_deck_id]["DeckName"],
        "backup_location": backup_location,
        "weighted_mode_used": game.use_weighted_mode,
        "rating_results": response_changes
    }


@app.get("/stats/deck-vs-deck")
def get_deck_vs_deck_damage(source_deck_id: str, target_deck_id: str):
    decks = load_decks()

    if source_deck_id not in decks:
        raise HTTPException(status_code=404, detail="Source deck not found")

    if target_deck_id not in decks:
        raise HTTPException(status_code=404, detail="Target deck not found")

    total_damage = 0
    games = set()

    rows = read_csv_file(DAMAGE_FILE)

    for row in rows:
        if (
            row["SourceDeckID"] == source_deck_id
            and row["TargetDeckID"] == target_deck_id
        ):
            total_damage += int(row["DamageAmount"])
            games.add(row["GameID"])

    return {
        "source_deck_id": source_deck_id,
        "source_deck_name": decks[source_deck_id]["DeckName"],
        "target_deck_id": target_deck_id,
        "target_deck_name": decks[target_deck_id]["DeckName"],
        "total_damage": total_damage,
        "games_with_damage": len(games)
    }


@app.get("/stats/deck/{deck_id}")
def get_deck_stats(deck_id: str):
    decks = load_decks()

    if deck_id not in decks:
        raise HTTPException(status_code=404, detail="Deck not found")

    participant_rows = read_csv_file(PARTICIPANTS_FILE)

    games_played = 0
    wins = 0
    total_eliminations = 0
    total_damage_dealt = 0
    total_damage_taken = 0

    for row in participant_rows:
        if row["DeckID"] == deck_id:
            games_played += 1
            total_eliminations += int(row["Eliminations"])
            total_damage_dealt += int(row["DamageDealt"])
            total_damage_taken += int(row["DamageTaken"])

            if int(row["Placement"]) == 1:
                wins += 1

    win_rate = 0

    if games_played > 0:
        win_rate = round((wins / games_played) * 100, 2)

    return {
        "deck_id": deck_id,
        "deck_name": decks[deck_id]["DeckName"],
        "commander": decks[deck_id]["Commander"],
        "current_elo": decks[deck_id]["ELO"],
        "games_played": games_played,
        "wins": wins,
        "win_rate_percent": win_rate,
        "total_eliminations": total_eliminations,
        "total_damage_dealt": total_damage_dealt,
        "total_damage_taken": total_damage_taken
    }


@app.get("/elo-history/{deck_id}")
def get_elo_history(deck_id: str):
    decks = load_decks()

    if deck_id not in decks:
        raise HTTPException(status_code=404, detail="Deck not found")

    rows = read_csv_file(ELO_HISTORY_FILE)

    history = []

    for row in rows:
        if row["DeckID"] == deck_id:
            history.append(row)

    return {
        "deck_id": deck_id,
        "deck_name": decks[deck_id]["DeckName"],
        "history": history
    }