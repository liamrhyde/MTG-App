from itertools import combinations
import csv
import shutil
from datetime import datetime
from pathlib import Path


# =========================
# File paths
# =========================

BASE_DIR = Path(r"C:\Users\lhyde\OneDrive - ASML\Personal\Python\Elo_calculatr_DB_user")
DB_DIR = BASE_DIR / "database"

PLAYERS_FILE = DB_DIR / "players.txt"
DECKS_FILE = DB_DIR / "decks.txt"
GAMES_FILE = DB_DIR / "games.txt"
PARTICIPANTS_FILE = DB_DIR / "game_participants.txt"
DAMAGE_FILE = DB_DIR / "damage_events.txt"
ELO_HISTORY_FILE = DB_DIR / "elo_history.txt"


# =========================
# Settings
# =========================

K_FACTOR = 32

WEIGHTS = {
    "placement": 0.7,
    "eliminations": 0.2,
    "damage": 0.1
}


# =========================
# Utility functions
# =========================

def ensure_database_files_exist():
    """
    Creates the database folder and empty files with headers if they do not exist.
    """

    DB_DIR.mkdir(parents=True, exist_ok=True)

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


def backup_file(filename):

    filename = Path(filename)

    # Create backups directory if it doesn't exist
    backup_dir = filename.parent / "backups"
    backup_dir.mkdir(exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    backup_name = backup_dir / (
        f"{filename.stem}_backup_{timestamp}{filename.suffix}"
    )

    shutil.copy2(filename, backup_name)

    print(f"Backup created: {backup_name}")


def backup_database():
    """
    Backs up all database files before making changes.
    """

    database_files = [
        PLAYERS_FILE,
        DECKS_FILE,
        GAMES_FILE,
        PARTICIPANTS_FILE,
        DAMAGE_FILE,
        ELO_HISTORY_FILE
    ]

    for file_path in database_files:
        backup_file(file_path)


def append_row(file_path, fieldnames, row):
    """
    Appends a single row to a CSV text file.
    """

    with open(file_path, "a", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writerow(row)


def generate_game_id():
    """
    Creates a unique game ID based on date and time.
    Example: G20260807_145522
    """

    return "G" + datetime.now().strftime("%Y%m%d_%H%M%S")


# =========================
# Load database data
# =========================

def load_decks():
    """
    Loads decks from decks.txt.

    Returns:
        decks_by_id:
            {
                "D001": {
                    "DeckID": "D001",
                    "PlayerID": "P001",
                    "DeckName": "Atraxa",
                    "Commander": "Atraxa Praetors Voice",
                    "ELO": 1500
                }
            }

        decks_by_name:
            {
                "Atraxa": "D001"
            }
    """

    decks_by_id = {}
    decks_by_name = {}

    with open(DECKS_FILE, newline="") as file:
        reader = csv.DictReader(file)

        for row in reader:
            row["ELO"] = int(row["ELO"])

            deck_id = row["DeckID"]
            deck_name = row["DeckName"]

            decks_by_id[deck_id] = row
            decks_by_name[deck_name.lower()] = deck_id

    return decks_by_id, decks_by_name


def save_decks(decks_by_id):
    """
    Saves updated deck Elo values back to decks.txt.
    """

    fieldnames = ["DeckID", "PlayerID", "DeckName", "Commander", "ELO"]

    with open(DECKS_FILE, "w", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()

        for deck in decks_by_id.values():
            writer.writerow({
                "DeckID": deck["DeckID"],
                "PlayerID": deck["PlayerID"],
                "DeckName": deck["DeckName"],
                "Commander": deck["Commander"],
                "ELO": deck["ELO"]
            })


# =========================
# User input functions
# =========================

def select_game_decks(decks_by_id, decks_by_name):
    """
    Asks user how many players are playing and lets them select decks.
    Returns a dictionary of selected deck IDs and current Elo ratings.

    Example:
        {
            "D001": 1500,
            "D002": 1500
        }
    """

    selected_ratings = {}

    print("\nAvailable decks:")
    for deck in decks_by_id.values():
        print(
            f'{deck["DeckID"]}: {deck["DeckName"]} '
            f'({deck["Commander"]}) - ELO {deck["ELO"]}'
        )

    num_players = int(input("\nHow many players? "))

    for i in range(num_players):
        while True:
            deck_input = input(f"Enter deck name or DeckID for player {i + 1}: ").strip()

            deck_id = None

            if deck_input in decks_by_id:
                deck_id = deck_input
            elif deck_input.lower() in decks_by_name:
                deck_id = decks_by_name[deck_input.lower()]

            if deck_id is None:
                print("Deck does not exist. Try again.")
                continue

            if deck_id in selected_ratings:
                print("This deck has already been selected. Try again.")
                continue

            selected_ratings[deck_id] = decks_by_id[deck_id]["ELO"]
            break

    print("\nDecks selected for this game:")
    for deck_id in selected_ratings:
        print(f'- {decks_by_id[deck_id]["DeckName"]}')

    return selected_ratings


def enter_placements(selected_ratings, decks_by_id):
    """
    Gets placement order from the user.

    Returns:
        placements:
            {
                "D001": 1,
                "D002": 2,
                "D003": 3,
                "D004": 4
            }

        placement_order:
            ["D001", "D002", "D003", "D004"]
    """

    placements = {}
    placement_order = []
    remaining_decks = list(selected_ratings.keys())

    print("\nEnter placements:")

    for place in range(1, len(selected_ratings) + 1):
        while True:
            print("\nRemaining decks:")
            for deck_id in remaining_decks:
                print(f'{deck_id}: {decks_by_id[deck_id]["DeckName"]}')

            deck_input = input(f"Enter deck finishing in position {place}: ").strip()

            if deck_input not in remaining_decks:
                print("Invalid deck ID or deck already placed. Try again.")
                continue

            placements[deck_input] = place
            placement_order.append(deck_input)
            remaining_decks.remove(deck_input)
            break

    return placements, placement_order


def enter_eliminations(selected_ratings, decks_by_id):
    """
    Gets eliminations per deck.
    """

    eliminations = {}

    print("\nEnter eliminations:")

    for deck_id in selected_ratings:
        deck_name = decks_by_id[deck_id]["DeckName"]

        while True:
            try:
                value = int(input(f"Eliminations by {deck_name}: "))
                eliminations[deck_id] = value
                break
            except ValueError:
                print("Please enter a valid integer.")

    return eliminations


def enter_life_remaining(selected_ratings, decks_by_id):
    """
    Gets life remaining per deck at the end of the game.
    """

    life_remaining = {}

    print("\nEnter life remaining:")

    for deck_id in selected_ratings:
        deck_name = decks_by_id[deck_id]["DeckName"]

        while True:
            try:
                value = int(input(f"Life remaining for {deck_name}: "))
                life_remaining[deck_id] = value
                break
            except ValueError:
                print("Please enter a valid integer.")

    return life_remaining


def enter_damage_matrix(selected_ratings, decks_by_id):
    """
    Gets damage dealt from each deck to each other deck.

    Returns:
        damage_events:
            [
                {
                    "SourceDeckID": "D001",
                    "TargetDeckID": "D002",
                    "DamageAmount": 20
                }
            ]

        damage_dealt:
            {
                "D001": 45
            }

        damage_taken:
            {
                "D002": 20
            }
    """

    damage_events = []
    damage_dealt = {deck_id: 0 for deck_id in selected_ratings}
    damage_taken = {deck_id: 0 for deck_id in selected_ratings}

    print("\nEnter damage dealt between decks.")
    print("Use total damage for the whole game, not turn-by-turn damage.")

    for source_id in selected_ratings:
        source_name = decks_by_id[source_id]["DeckName"]

        for target_id in selected_ratings:
            if source_id == target_id:
                continue

            target_name = decks_by_id[target_id]["DeckName"]

            while True:
                try:
                    damage = int(
                        input(f"Damage dealt by {source_name} to {target_name}: ")
                    )

                    if damage < 0:
                        print("Damage cannot be negative.")
                        continue

                    break

                except ValueError:
                    print("Please enter a valid integer.")

            if damage > 0:
                damage_events.append({
                    "SourceDeckID": source_id,
                    "TargetDeckID": target_id,
                    "DamageAmount": damage
                })

            damage_dealt[source_id] += damage
            damage_taken[target_id] += damage

    return damage_events, damage_dealt, damage_taken


# =========================
# Elo calculation
# =========================

def expected_score(rating_a, rating_b):
    """
    Calculate expected score for Deck A against Deck B.
    """

    return 1 / (1 + 10 ** ((rating_b - rating_a) / 400))


def performance_scores(placements, eliminations, damage_dealt):
    """
    Calculates weighted performance score for each deck.

    Score is based on:
    - placement
    - eliminations
    - damage dealt
    """

    scores = {}

    max_elims = max(eliminations.values()) or 1
    total_damage = sum(damage_dealt.values()) or 1
    num_players = len(placements)

    for deck_id in placements:
        if num_players == 1:
            placement_score = 1
        else:
            placement_score = (
                (num_players - placements[deck_id])
                / (num_players - 1)
            )

        elim_score = eliminations[deck_id] / max_elims
        damage_score = damage_dealt[deck_id] / total_damage

        scores[deck_id] = (
            WEIGHTS["placement"] * placement_score
            + WEIGHTS["eliminations"] * elim_score
            + WEIGHTS["damage"] * damage_score
        )

    return scores


def update_elo(ratings, placement_order, use_weighted_mode=False, scores=None, k=K_FACTOR):
    """
    Updates Elo ratings based on pairwise placement results.

    ratings:
        {
            "D001": 1500,
            "D002": 1500
        }

    placement_order:
        ["D001", "D002", "D003", "D004"]

    use_weighted_mode:
        If True, uses performance scores instead of simple win/loss result.
    """

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
    fieldnames = ["GameID", "DatePlayed", "NumberOfTurns", "WinnerDeckID"]

    append_row(
        GAMES_FILE,
        fieldnames,
        {
            "GameID": game_id,
            "DatePlayed": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "NumberOfTurns": number_of_turns,
            "WinnerDeckID": winner_deck_id
        }
    )


def save_game_participants(
    game_id,
    placements,
    eliminations,
    life_remaining,
    damage_dealt,
    damage_taken
):
    fieldnames = [
        "GameID",
        "DeckID",
        "Placement",
        "Eliminations",
        "LifeRemaining",
        "DamageDealt",
        "DamageTaken"
    ]

    for deck_id in placements:
        append_row(
            PARTICIPANTS_FILE,
            fieldnames,
            {
                "GameID": game_id,
                "DeckID": deck_id,
                "Placement": placements[deck_id],
                "Eliminations": eliminations[deck_id],
                "LifeRemaining": life_remaining[deck_id],
                "DamageDealt": damage_dealt[deck_id],
                "DamageTaken": damage_taken[deck_id]
            }
        )


def save_damage_events(game_id, damage_events):
    fieldnames = ["GameID", "SourceDeckID", "TargetDeckID", "DamageAmount"]

    for event in damage_events:
        append_row(
            DAMAGE_FILE,
            fieldnames,
            {
                "GameID": game_id,
                "SourceDeckID": event["SourceDeckID"],
                "TargetDeckID": event["TargetDeckID"],
                "DamageAmount": event["DamageAmount"]
            }
        )


def save_elo_history(game_id, old_ratings, new_ratings):
    fieldnames = ["GameID", "DeckID", "OldELO", "NewELO", "ELOChange"]

    for deck_id in old_ratings:
        old_elo = old_ratings[deck_id]
        new_elo = new_ratings[deck_id]
        elo_change = new_elo - old_elo

        append_row(
            ELO_HISTORY_FILE,
            fieldnames,
            {
                "GameID": game_id,
                "DeckID": deck_id,
                "OldELO": old_elo,
                "NewELO": new_elo,
                "ELOChange": elo_change
            }
        )


# =========================
# Stats functions
# =========================

def deck_vs_deck_damage(source_deck_id, target_deck_id):
    """
    Returns total damage source deck has dealt to target deck
    and the number of games where that happened.
    """

    total_damage = 0
    games = set()

    with open(DAMAGE_FILE, newline="") as file:
        reader = csv.DictReader(file)

        for row in reader:
            if (
                row["SourceDeckID"] == source_deck_id
                and row["TargetDeckID"] == target_deck_id
            ):
                total_damage += int(row["DamageAmount"])
                games.add(row["GameID"])

    return total_damage, len(games)


def print_leaderboard(decks_by_id):
    """
    Prints decks sorted by Elo.
    """

    sorted_decks = sorted(
        decks_by_id.values(),
        key=lambda deck: deck["ELO"],
        reverse=True
    )

    print("\nLeaderboard:")
    print("-------------------------")

    for index, deck in enumerate(sorted_decks, start=1):
        print(
            f'{index}. {deck["DeckName"]} '
            f'({deck["Commander"]}) - {deck["ELO"]}'
        )


# =========================
# Main program
# =========================

def main():
    ensure_database_files_exist()

    decks_by_id, decks_by_name = load_decks()

    print_leaderboard(decks_by_id)

    use_weighted_mode_input = input("\nUse weighted mode? (y/n): ").lower().strip()
    use_weighted_mode = use_weighted_mode_input == "y"

    selected_ratings = select_game_decks(decks_by_id, decks_by_name)

    placements, placement_order = enter_placements(selected_ratings, decks_by_id)

    eliminations = enter_eliminations(selected_ratings, decks_by_id)

    life_remaining = enter_life_remaining(selected_ratings, decks_by_id)

    damage_events, damage_dealt, damage_taken = enter_damage_matrix(
        selected_ratings,
        decks_by_id
    )

    number_of_turns = int(input("\nNumber of turns: "))

    winner_deck_id = placement_order[0]

    if use_weighted_mode:
        scores = performance_scores(placements, eliminations, damage_dealt)
    else:
        scores = None

    new_ratings, changes = update_elo(
        selected_ratings,
        placement_order,
        use_weighted_mode=use_weighted_mode,
        scores=scores
    )

    game_id = generate_game_id()

    backup_database()

    save_game(game_id, number_of_turns, winner_deck_id)

    save_game_participants(
        game_id,
        placements,
        eliminations,
        life_remaining,
        damage_dealt,
        damage_taken
    )

    save_damage_events(game_id, damage_events)

    save_elo_history(game_id, selected_ratings, new_ratings)

    for deck_id, new_elo in new_ratings.items():
        decks_by_id[deck_id]["ELO"] = new_elo

    save_decks(decks_by_id)

    print("\nGame saved successfully.")
    print(f"Game ID: {game_id}")

    print("\nRating Changes:")
    for deck_id, change in changes.items():
        deck_name = decks_by_id[deck_id]["DeckName"]
        print(f"{deck_name}: {change:+.1f}")

    print("\nNew Ratings:")
    for deck_id, rating in new_ratings.items():
        deck_name = decks_by_id[deck_id]["DeckName"]
        print(f"{deck_name}: {rating}")

    print_leaderboard(decks_by_id)


if __name__ == "__main__":
    main()