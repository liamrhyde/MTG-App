import { useState } from "react";
import { useParams } from "wouter";
import { PlayerSector } from "@/views/Game/PlayerSector";
import type { Deck, Player, UUID } from "@/views/NewGame/schemas";

export interface PlayerGameState {
    playerId: UUID;
    deckId: UUID;
    health: number;
    counters: Record<string, number>;
}

const MOCK_PLAYERS: Record<UUID, Player> = {
    p1: { id: "p1", name: "Alice" },
    p2: { id: "p2", name: "Bob" },
    p3: { id: "p3", name: "Charlie" },
    p4: { id: "p4", name: "Diana" },
};

const MOCK_DECKS: Record<UUID, Deck> = {
    "d-p1-1": { id: "d-p1-1", name: "Mono Red Aggro", player: "p1" },
    "d-p2-1": { id: "d-p2-1", name: "Blue Control", player: "p2" },
    "d-p3-1": { id: "d-p3-1", name: "Green Ramp", player: "p3" },
    "d-p4-1": { id: "d-p4-1", name: "Black Discard", player: "p4" },
};

const MOCK_GAME_PLAYERS: PlayerGameState[] = [
    { playerId: "p1", deckId: "d-p1-1", health: 40, counters: {} },
    { playerId: "p2", deckId: "d-p2-1", health: 40, counters: {} },
    { playerId: "p3", deckId: "d-p3-1", health: 40, counters: {} },
    { playerId: "p4", deckId: "d-p4-1", health: 40, counters: {} },
];

export const GameView = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const [selectedPlayerId, setSelectedPlayerId] = useState<UUID | null>(null);

    return (
        <div className="relative flex flex-col h-dvh bg-background overflow-hidden">
            <span className="absolute top-2 left-3 z-10 text-xs text-muted-foreground">
                Game {gameId}
            </span>
            <div className="grid grid-rows-2 grid-flow-col auto-cols-fr flex-1 min-h-0 gap-2 sm:gap-3 p-2 sm:p-3">
                {MOCK_GAME_PLAYERS.map((gp) => (
                    <PlayerSector
                        key={gp.playerId}
                        player={MOCK_PLAYERS[gp.playerId]}
                        deck={MOCK_DECKS[gp.deckId]}
                        gameState={gp}
                        isSelected={selectedPlayerId === gp.playerId}
                        onSelect={setSelectedPlayerId}
                    />
                ))}
            </div>
        </div>
    );
};
