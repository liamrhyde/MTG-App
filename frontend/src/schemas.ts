import * as v from "valibot";

/* Player */

export interface Player {
    id: number;
    name: string;
}

export const PlayerCreationSchema = v.object({
    name: v.pipe(v.string(), v.trim(), v.nonEmpty("Name required")),
});

export type CreatePlayer = v.InferOutput<typeof PlayerCreationSchema>;

/* Deck */

export interface Deck {
    id: number;
    name: string;
    ownerId: number;
}

export const DeckCreationSchema = v.object({
    name: v.pipe(v.string(), v.trim(), v.nonEmpty("Deck Name required")),
    ownerId: v.pipe(v.number("Owner id required")),
});

export type CreateDeck = v.InferOutput<typeof DeckCreationSchema>;

/* Game setup */

export const GameSelectionSchema = v.object({
    selectedDecks: v.pipe(
        v.array(
            v.object({
                deckId: v.number("Deck id required"),
                playerId: v.number("Player id required"),
            }),
        ),
        v.maxLength(8),
        v.minLength(2, "Minumum 2 players required"),
    ),
});

/* Live game state */

export interface PlayerGameState {
    deckId: number;
    health: number;
    poison: number;
    commander: Record<number, number>;
}

export type GameState = Record<number, PlayerGameState>;

export interface PlayerHealthChange {
    health: number;
    poison: number;
    commander: number;
}

export interface GameStateChange {
    sourcePlayer: number;
    targets: Record<
        number, // Target Player ID
        PlayerHealthChange
    >;
}
