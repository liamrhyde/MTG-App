import { useState } from "react";
import { useParams } from "wouter";
import { GameDeckSection } from "@/views/Game/GameDeckSection";
import type { GameStateChange, DeckHealthChange } from "@/schemas";
import { useGame } from "@/hooks/useGames";

export const GameView = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);

    const { gameData } = useGame(gameId);

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
            <div className="grid grid-rows-2 grid-flow-col auto-cols-fr flex-1 min-h-0 gap-2 lg:gap-3 p-0 md:p-1">
                {gameData &&
                    Object.entries(gameData.gameMembers).map(
                        ([deckId, memberData]) => (
                            <GameDeckSection
                                key={deckId}
                                gameDeckId={memberData.deckId}
                                memberData={gameData.gameMembers}
                                deckGameState={
                                    gameData.gameState?.[Number(deckId)]
                                }
                                selectedDeckId={selectedDeckId}
                                onSelect={handleSelectDeck}
                                onHealthStateChange={handleHealthChange}
                                deckHealthChange={
                                    gameStateChange?.targets?.[Number(deckId)]
                                }
                                onSubmit={handleSubmit}
                                onCancel={handleCancel}
                            />
                        ),
                    )}
            </div>
        </div>
    );
};
