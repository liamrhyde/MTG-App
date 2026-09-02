import * as v from "valibot";

/* Player */

export interface Player {
    id: string;
    name: string;
}

export const PlayerCreationSchema = v.object({
    name: v.pipe(v.string(), v.trim(), v.nonEmpty("Name required")),
});

export type CreatePlayer = v.InferOutput<typeof PlayerCreationSchema>;

/* Deck */

export interface Deck {
    id: string;
    name: string;
    ownerId: string;
}

export const DeckCreationSchema = v.object({
    name: v.pipe(v.string(), v.trim(), v.nonEmpty("Deck Name required")),
    ownerId: v.pipe(v.string(), v.nonEmpty("Owner Player required")),
});

export type CreateDeck = v.InferOutput<typeof DeckCreationSchema>;

/* Game setup */

export const GameSelectionSchema = v.object({
    selectedDecks: v.pipe(
        v.array(
            v.object({
                deckId: v.pipe(v.string(), v.nonEmpty("Deck required")),
                playerId: v.pipe(v.string(), v.nonEmpty("Player required")),
            }),
        ),
        v.maxLength(8),
        v.minLength(2, "Minumum 2 players required"),
    ),
});

/* Live game state */

export interface PlayerGameState {
    deckId: string;
    health: number;
    poison: number;
    commander: Record<string, number>;
}

export type GameState = Record<string, PlayerGameState>;

export interface PlayerHealthChange {
    health: number;
    poison: number;
    commander: number;
}

export interface GameStateChange {
    sourcePlayer: string;
    targets: Record<
        string, // Target Player ID
        PlayerHealthChange
    >;
}
