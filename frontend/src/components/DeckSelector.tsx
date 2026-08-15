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
    playerName?: string;
    deckName?: string;
};

export interface Player {
    name: string;
    decks: string[];
}

interface DeckSelectorProps {
    value: DeckSelectorValue;
    onChange: (index: number, value: DeckSelectorValue) => void;
    players: Player[];
    onRemove?: (index: number) => void;
    index: number;
}

export const DeckSelector = ({
    value,
    onChange,
    players,
    onRemove,
    index,
}: DeckSelectorProps) => {
    const [playerName, setPlayerName] = useState(value.playerName ?? "");
    const [deckName, setDeckName] = useState(value.deckName ?? "");

    const currentPlayer = players.find((p) => p.name === playerName);
    const availableDecks = currentPlayer?.decks ?? [];

    const notifyChange = (player: string, deck: string) => {
        onChange(index, { playerName: player, deckName: deck });
    };

    const handlePlayerChange = (newPlayerName: string | null) => {
        if (newPlayerName) {
            setPlayerName(newPlayerName);
            setDeckName("");
            notifyChange(newPlayerName, "");
        }
    };

    const handleDeckChange = (newDeckName: string | null) => {
        if (newDeckName) {
            setDeckName(newDeckName);
            notifyChange(playerName, newDeckName);
        }
    };

    return (
        <div className="relative rounded-lg border border-border bg-muted/30 p-6">
            {/* Remove button - top right corner */}
            {onRemove && (
                <button
                    onClick={() => onRemove(index)}
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
                        value={playerName}
                        onValueChange={handlePlayerChange}
                    >
                        <ComboboxInput showClear={!!playerName} />
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
                        value={deckName}
                        onValueChange={handleDeckChange}
                        disabled={!playerName}
                    >
                        <ComboboxInput
                            showClear={!!deckName}
                            placeholder={
                                !playerName
                                    ? "Select a player first"
                                    : "Select a deck"
                            }
                        />
                        {/* TODO: Render custom Deck tile with more deck info */}
                        {playerName && (
                            <ComboboxContent>
                                <ComboboxList>
                                    {availableDecks.map((deck) => (
                                        <ComboboxItem key={deck} value={deck}>
                                            {deck}
                                        </ComboboxItem>
                                    ))}
                                    {/* TODO: Consider direct 'add deck' action */}
                                </ComboboxList>
                                <ComboboxEmpty>No decks found.</ComboboxEmpty>
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
