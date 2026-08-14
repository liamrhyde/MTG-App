import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DeckSelector,
    type DeckSelectorValue,
    type Player,
} from "@/components/DeckSelector";

type Selection = {
    id: string;
    playerName: string | null;
    deckName: string | null;
};

const MOCK_PLAYERS: Player[] = [
    { name: "Alice", decks: ["Mono Red Aggro", "Golgari Midrange"] },
    { name: "Bob", decks: ["Azorius Control"] },
    { name: "Charlie", decks: ["Gruul Stompy", "Boros Aggro", "Simic Ramp"] },
    { name: "Dana", decks: ["Dimir Mill", "Selesnya Tokens"] },
    { name: "Liam", decks: [] },
];

export const CreateGame = () => {
    const [selections, setSelections] = useState<Selection[]>([
        { id: crypto.randomUUID(), playerName: null, deckName: null },
    ]);

    const updateSelection = (id: string, next: DeckSelectorValue) => {
        setSelections((prev) =>
            prev.map((sel) => (sel.id === id ? { ...sel, ...next } : sel)),
        );
    };

    const removeSelection = (id: string) => {
        setSelections((prev) => prev.filter((sel) => sel.id !== id));
    };

    const addSelection = () => {
        if (selections.length < 8) {
            setSelections((prev) => [
                ...prev,
                { id: crypto.randomUUID(), playerName: null, deckName: null },
            ]);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Main content - scrollable */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-6 max-w-screen-xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">Create Game</h1>

                    {/* Player/Deck Selectors */}
                    <div className="space-y-4 mb-6">
                        {selections.map((selection) => (
                            <DeckSelector
                                key={selection.id}
                                value={{
                                    playerName: selection.playerName,
                                    deckName: selection.deckName,
                                }}
                                onChange={(next) =>
                                    updateSelection(selection.id, next)
                                }
                                players={MOCK_PLAYERS}
                                onRemove={
                                    selections.length > 1
                                        ? () => removeSelection(selection.id)
                                        : undefined
                                }
                            />
                        ))}
                    </div>

                    {/* Add Player Button */}
                    <Button
                        onClick={addSelection}
                        variant="outline"
                        disabled={selections.length >= 8}
                    >
                        + Add Player
                    </Button>

                    {selections.length >= 8 && (
                        <p className="text-sm text-muted-foreground mt-2">
                            Maximum 8 players reached
                        </p>
                    )}
                </div>
            </div>

            {/* Fixed bottom nav - safe area aware */}
            <div className="border-t bg-background/80 backdrop-blur-sm sticky bottom-0">
                <div className="p-4 space-y-2 md:space-y-0 md:flex md:gap-3 max-w-screen-xl mx-auto">
                    <Button className="w-full md:flex-1" size="lg">
                        Start Game
                    </Button>
                </div>
                {/* Safe area spacer for iOS notch/home indicator */}
                <div
                    className="h-safe-bottom"
                    style={{
                        height: "max(0.5rem, env(safe-area-inset-bottom))",
                    }}
                />
            </div>
        </div>
    );
};
