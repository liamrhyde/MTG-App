import { useState } from "react";
import { useParams } from "wouter";
import { PlayerSector } from "@/views/Game/PlayerSector";
import type { Deck, Player, UUID } from "@/views/NewGame/schemas";
import type { GameState } from "@/views/Game/schemas";

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

const MOCK_GAME_STATE: GameState = {
    p1: { deckId: "d-p1-1", health: 40, poison: 0, commander: { p2: 0, p3: 0, p4: 0 } },
    p2: { deckId: "d-p2-1", health: 40, poison: 0, commander: { p1: 0, p3: 0, p4: 0 } },
    p3: { deckId: "d-p3-1", health: 40, poison: 0, commander: { p1: 0, p2: 0, p4: 0 } },
    p4: { deckId: "d-p4-1", health: 40, poison: 0, commander: { p1: 0, p2: 0, p3: 0 } },
};

export const GameView = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const [selectedPlayerId, setSelectedPlayerId] = useState<UUID | null>(null);
    const [gameState, setGameState] = useState<GameState>(MOCK_GAME_STATE);

    const handleHealthChange = (playerId: UUID, health: number) => {
        setGameState((prev) => ({
            ...prev,
            [playerId]: {
                ...prev[playerId],
                health,
            },
        }));
    };

    return (
        <div className="relative flex flex-col h-dvh bg-background overflow-hidden">
            <span className="absolute top-2 left-3 z-10 text-xs text-muted-foreground">
                Game {gameId}
            </span>
            <div className="grid grid-rows-2 grid-flow-col auto-cols-fr flex-1 min-h-0 gap-2 sm:gap-3 p-2 sm:p-3">
                {Object.entries(gameState).map(([playerId, healthState]) => (
                    <PlayerSector
                        key={playerId}
                        playerId={playerId as UUID}
                        player={MOCK_PLAYERS[playerId]}
                        deck={MOCK_DECKS[healthState.deckId]}
                        healthState={healthState}
                        selectedPlayerId={selectedPlayerId}
                        onSelect={setSelectedPlayerId}
                        onHealthChange={(health) =>
                            handleHealthChange(playerId as UUID, health)
                        }
                    />
                ))}
            </div>
        </div>
    );
};
