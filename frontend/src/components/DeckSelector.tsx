import { useState } from "react";
import { X } from "lucide-react";

import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty,
} from "@/components/ui/combobox";

export type DeckSelectorValue = {
    playerName: string | null;
    deckName: string | null;
};

export interface Player {
    name: string;
    decks: string[];
}

interface DeckSelectorProps {
    value: DeckSelectorValue;
    onChange: (value: DeckSelectorValue) => void;
    players: Player[];
    onRemove?: () => void;
}

export const DeckSelector = ({
    value,
    onChange,
    players,
    onRemove,
}: DeckSelectorProps) => {
    const [playerOpen, setPlayerOpen] = useState(false);
    const [deckOpen, setDeckOpen] = useState(false);

    const currentPlayer = players.find((p) => p.name === value.playerName);
    const availableDecks = currentPlayer?.decks ?? [];

    const handlePlayerChange = (playerName: string | null) => {
        onChange({ playerName, deckName: null });
        setPlayerOpen(false);
    };

    const handleDeckChange = (deckName: string | null) => {
        onChange({ ...value, deckName });
        setDeckOpen(false);
    };

    return (
        <div className="relative rounded-lg border border-border bg-muted/30 p-6">
            {/* Remove button - top right corner */}
            {onRemove && (
                <button
                    onClick={onRemove}
                    className="absolute top-3 right-3 p-1.5 hover:bg-muted rounded-md transition-colors"
                    aria-label="Remove player"
                >
                    <X className="h-4 w-4 text-muted-foreground" />
                </button>
            )}

            {/* Player and Deck selectors */}
            <div className="flex flex-col gap-4 md:flex-row md:gap-6">
                {/* Player Combobox */}
                <div className="flex-1">
                    <label className="text-sm font-medium text-foreground mb-2 block">
                        Player
                    </label>
                    <Combobox
                        open={playerOpen}
                        onOpenChange={setPlayerOpen}
                        value={value.playerName ?? ""}
                        onValueChange={handlePlayerChange}
                    >
                        <ComboboxInput showClear={!!value.playerName} />
                        <ComboboxContent>
                            <ComboboxList>
                                {players.map((player) => (
                                    <ComboboxItem
                                        key={player.name}
                                        value={player.name}
                                    >
                                        {player.name}
                                    </ComboboxItem>
                                ))}
                                <ComboboxEmpty>No players found.</ComboboxEmpty>
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>
                </div>

                {/* Deck Combobox */}
                <div className="flex-1">
                    <label className="text-sm font-medium text-foreground mb-2 block">
                        Deck
                    </label>
                    <Combobox
                        open={deckOpen}
                        onOpenChange={setDeckOpen}
                        value={value.deckName ?? ""}
                        onValueChange={handleDeckChange}
                        disabled={!value.playerName}
                    >
                        <ComboboxInput
                            showClear={!!value.deckName}
                            placeholder={
                                !value.playerName
                                    ? "Select a player first"
                                    : "Select a deck"
                            }
                        />
                        {/* TODO: Render custom Deck tile with more deck info */}
                        {value.playerName && (
                            <ComboboxContent>
                                <ComboboxList>
                                    {availableDecks.map((deck) => (
                                        <ComboboxItem key={deck} value={deck}>
                                            {deck}
                                        </ComboboxItem>
                                    ))}
                                    {/* TODO: Consider direct 'add deck' action */}
                                    <ComboboxEmpty>
                                        No decks found.
                                    </ComboboxEmpty>
                                </ComboboxList>
                            </ComboboxContent>
                        )}
                    </Combobox>
                </div>
            </div>

            {/* Deck info placeholder */}
            <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                    Deck stats coming soon
                </p>
            </div>
        </div>
    );
};
