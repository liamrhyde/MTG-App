import { useState } from "react";
import { X } from "lucide-react";

import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty,
    ComboboxGroup,
    ComboboxCollection,
    ComboboxLabel,
    ComboboxSeparator,
} from "@/components/ui/combobox";

export type UUID = string;

export interface Player {
    id: UUID;
    name: string;
}

export interface Deck {
    id: UUID;
    name: string;
    player: UUID;
}

export interface DeckSelection {
    player: Player;
    deck?: Deck;
}

interface DeckSelectorProps {
    value: DeckSelection | undefined;
    onChange: (index: number, value: DeckSelection) => void;
    players: Player[];
    decks: Deck[];
    onRemove?: (index: number) => void;
    index: number;
}

export const DeckSelector = ({
    value,
    onChange,
    players,
    decks,
    onRemove,
    index,
}: DeckSelectorProps) => {
    const [selectedPlayer, setSelectedPlayer] = useState<Player | undefined>(
        () =>
            value ? players.find((p) => p.id === value.player.id) : undefined,
    );

    const playerDecks = selectedPlayer
        ? decks.filter((d) => d.player === selectedPlayer.id)
        : [];
    const otherDecks = selectedPlayer
        ? decks.filter((d) => d.player !== selectedPlayer.id)
        : [];
    const availableDecks = [
        {
            value: "Your Decks",
            items: playerDecks,
        },
        { value: "Other Player Decks", items: otherDecks },
    ] as const;
    console.log(availableDecks);

    const handlePlayerChange = (playerName: string | null) => {
        const player = playerName
            ? players.find((p) => p.name === playerName)
            : undefined;
        setSelectedPlayer(player);
        if (player) {
            onChange(index, { player });
        }
    };

    const handleDeckChange = (deckId: string | null) => {
        const deck = deckId ? decks.find((d) => d.id === deckId) : undefined;
        if (deck && selectedPlayer) {
            onChange(index, { player: selectedPlayer, deck });
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
                        value={selectedPlayer?.name ?? ""}
                        onValueChange={handlePlayerChange}
                        items={players}
                    >
                        <ComboboxInput
                            showClear={!!selectedPlayer}
                            placeholder="Select a player"
                        />
                        <ComboboxContent>
                            <ComboboxEmpty>No players found.</ComboboxEmpty>
                            <ComboboxList>
                                {(player) => (
                                    <ComboboxItem
                                        key={player.id}
                                        value={player.name}
                                    >
                                        {player.name}
                                    </ComboboxItem>
                                )}
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
                        value={value?.deck?.name ?? ""}
                        onValueChange={handleDeckChange}
                        disabled={!selectedPlayer}
                        items={availableDecks}
                    >
                        <ComboboxInput
                            showClear={!!value?.deck}
                            placeholder={
                                !selectedPlayer
                                    ? "Select a player first"
                                    : "Select a deck"
                            }
                            disabled={!selectedPlayer}
                        />
                        {/* TODO: Render custom Deck tile with more deck info */}
                        <ComboboxContent>
                            <ComboboxEmpty>No decks found.</ComboboxEmpty>
                            <ComboboxList>
                                {(group, index) => (
                                    <ComboboxGroup
                                        key={group.value}
                                        items={group.items}
                                    >
                                        <ComboboxLabel>
                                            {group.value}
                                        </ComboboxLabel>
                                        <ComboboxCollection>
                                            {(deck) => (
                                                <ComboboxItem
                                                    key={deck.id}
                                                    value={deck.id}
                                                >
                                                    {deck.name}
                                                </ComboboxItem>
                                            )}
                                        </ComboboxCollection>
                                        {index < availableDecks.length - 1 && (
                                            <ComboboxSeparator />
                                        )}
                                    </ComboboxGroup>
                                )}
                                {/* TODO: Consider direct 'add deck' action */}
                            </ComboboxList>
                        </ComboboxContent>
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
