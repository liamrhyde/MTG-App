import { useState } from "react";
import { useParams } from "wouter";
import { PlayerSector } from "@/views/Game/PlayerSector";
import type { Deck, Player, UUID } from "@/views/NewGame/schemas";
import type {
    GameState,
    GameStateChange,
    PlayerHealthChange,
} from "@/views/Game/schemas";

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
    p1: {
        deckId: "d-p1-1",
        health: 40,
        poison: 0,
        commander: { p2: 0, p3: 0, p4: 0 },
    },
    p2: {
        deckId: "d-p2-1",
        health: 40,
        poison: 0,
        commander: { p1: 0, p3: 0, p4: 0 },
    },
    p3: {
        deckId: "d-p3-1",
        health: 40,
        poison: 0,
        commander: { p1: 0, p2: 0, p4: 0 },
    },
    p4: {
        deckId: "d-p4-1",
        health: 40,
        poison: 0,
        commander: { p1: 0, p2: 0, p3: 0 },
    },
};

export const GameView = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const [selectedPlayerId, setSelectedPlayerId] = useState<UUID | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [gameState, setGameState] = useState<GameState>(MOCK_GAME_STATE);

    const [gameStateChange, setGameStateChange] =
        useState<GameStateChange | null>();

    const handleSelectPlayer = (playerId: string | null) => {
        if (selectedPlayerId || !playerId) {
            return;
        }
        setSelectedPlayerId((selection) => selection ?? playerId);
        setGameStateChange({ sourcePlayer: playerId, targets: {} });
    };

    const handleHealthChange = (
        targetPlayerId: UUID,
        healthType: keyof PlayerHealthChange,
        value: number,
    ) => {
        setGameStateChange((current) => {
            if (!current) return null;
            const targetPlayerData = current.targets?.[targetPlayerId] ?? {
                health: 0,
                poison: 0,
                commander: 0,
            };
            return {
                ...current,
                targets: {
                    ...current.targets,
                    [targetPlayerId]: {
                        ...targetPlayerData,
                        [healthType]: value,
                    },
                },
            };
        });
    };

    const handleSubmit = () => {
        setSelectedPlayerId(null);
        setGameStateChange(null);
    };

    const handleCancel = () => {
        setSelectedPlayerId(null);
        setGameStateChange(null);
    };

    return (
        <div className="relative flex flex-col h-dvh bg-background overflow-hidden">
            <span className="absolute top-2 left-3 z-10 text-xs text-muted-foreground">
                Game {gameId}
            </span>
            <div className="grid grid-rows-2 grid-flow-col auto-cols-fr flex-1 min-h-0 gap-2 lg:gap-3 p-0 md:p-1">
                {Object.entries(gameState).map(([playerId, playerState]) => (
                    <PlayerSector
                        key={playerId}
                        player={MOCK_PLAYERS[playerId]}
                        deck={MOCK_DECKS[playerState.deckId]}
                        playerGameState={playerState}
                        selectedPlayerId={selectedPlayerId}
                        onSelect={handleSelectPlayer}
                        onHealthStateChange={handleHealthChange}
                        playerHealthChange={
                            gameStateChange?.targets?.[playerId]
                        }
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                    />
                ))}
            </div>
        </div>
    );
};
