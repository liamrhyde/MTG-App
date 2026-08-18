import type { UUID } from "@/views/NewGame/schemas";

export interface PlayerGameState {
    deckId: UUID;
    health: number;
    poison: number;
    commander: Record<UUID, number>;
}

export type GameState = Record<UUID, PlayerGameState>;

export interface PlayerHealthChange {
    health: number;
    poison: number;
    commander: number;
}
export interface GameStateChange {
    sourcePlayer: UUID;
    targets: Record<
        UUID, // Target Player ID
        PlayerHealthChange
    >;
}
