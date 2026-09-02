import { useState } from "react";
import { useParams } from "wouter";
import { GameDeckSection } from "@/views/Game/GameDeckSection";
import type {
    Deck,
    Player,
    GameState,
    GameStateChange,
    DeckHealthChange,
} from "@/schemas";

const MOCK_PLAYERS: Record<number, Player> = {
    1: { id: 1, name: "Alice" },
    2: { id: 2, name: "Bob" },
    3: { id: 3, name: "Charlie" },
    4: { id: 4, name: "Diana" },
};

const MOCK_DECKS: Record<number, Deck> = {
    1: { id: 1, name: "Mono Red Aggro", ownerId: 1 },
    2: { id: 2, name: "Blue Control", ownerId: 2 },
    3: { id: 3, name: "Green Ramp", ownerId: 3 },
    4: { id: 4, name: "Black Discard", ownerId: 4 },
};

const MOCK_GAME_STATE: GameState = {
    1: {
        deckId: 1,
        health: 40,
        poison: 0,
        commander: { 2: 0, 3: 0, 4: 0 },
    },
    2: {
        deckId: 2,
        health: 40,
        poison: 0,
        commander: { 1: 0, 3: 0, 4: 0 },
    },
    3: {
        deckId: 3,
        health: 40,
        poison: 0,
        commander: { 1: 0, 2: 0, 4: 0 },
    },
    4: {
        deckId: 4,
        health: 40,
        poison: 0,
        commander: { 1: 0, 2: 0, 3: 0 },
    },
};

export const GameView = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [gameState, setGameState] = useState<GameState>(MOCK_GAME_STATE);

    const [gameStateChange, setGameStateChange] =
        useState<GameStateChange | null>();

    const handleSelectDeck = (deckId: number | null) => {
        if (selectedDeckId || !deckId) {
            return;
        }
        setSelectedDeckId((selection) => selection ?? deckId);
        setGameStateChange({ sourceDeck: deckId, targets: {} });
    };

    const handleHealthChange = (
        targetDeckId: number,
        healthType: keyof DeckHealthChange,
        value: number,
    ) => {
        setGameStateChange((current) => {
            if (!current) return null;
            const targetDeckData = current.targets?.[targetDeckId] ?? {
                health: 0,
                poison: 0,
                commander: 0,
            };
            return {
                ...current,
                targets: {
                    ...current.targets,
                    [targetDeckId]: {
                        ...targetDeckData,
                        [healthType]: value,
                    },
                },
            };
        });
    };

    const handleSubmit = () => {
        setSelectedDeckId(null);
        setGameStateChange(null);
    };

    const handleCancel = () => {
        setSelectedDeckId(null);
        setGameStateChange(null);
    };

    return (
        <div className="relative flex flex-col h-dvh bg-background overflow-hidden">
            <span className="absolute top-2 left-3 z-10 text-xs text-muted-foreground">
                Game {gameId}
            </span>
            <div className="grid grid-rows-2 grid-flow-col auto-cols-fr flex-1 min-h-0 gap-2 lg:gap-3 p-0 md:p-1">
                {Object.entries(gameState).map(([deckId, deckState]) => (
                    <GameDeckSection
                        key={deckId}
                        player={MOCK_PLAYERS[Number(deckId)]}
                        deck={MOCK_DECKS[deckState.deckId]}
                        deckGameState={deckState}
                        selectedDeckId={selectedDeckId}
                        onSelect={handleSelectDeck}
                        onHealthStateChange={handleHealthChange}
                        deckHealthChange={
                            gameStateChange?.targets?.[Number(deckId)]
                        }
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                    />
                ))}
            </div>
        </div>
    );
};
