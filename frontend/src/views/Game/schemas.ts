import type { UUID } from "@/views/NewGame/schemas";

export interface PlayerHealthState {
	deckId: UUID;
	health: number;
	poison: number;
	commander: Record<UUID, number>;
}

export type GameState = Record<UUID, PlayerHealthState>;
