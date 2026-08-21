import * as v from "valibot";

export type UUID = string;

export interface Player {
    id: UUID;
    name: string;
}

export interface Deck {
    id: UUID;
    name: string;
    player: UUID;
}

export const GameSelectionSchema = v.object({
    selectedDecks: v.pipe(
        v.array(
            v.object({
                playerId: v.pipe(v.string(), v.nonEmpty("Player required")),
                deckId: v.pipe(v.string(), v.nonEmpty("Deck required")),
            }),
        ),
        v.maxLength(8),
        v.minLength(2, "Minumum 2 players required"),
    ),
});
