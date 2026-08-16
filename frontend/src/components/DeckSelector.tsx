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

export interface DeckSelectionIds {
    playerId?: UUID;
    deckId?: UUID;
}

interface DeckSelectorProps {
    value: DeckSelectionIds | undefined;
    onChange: (index: number, value: DeckSelectionIds) => void;
    playersById: Record<UUID, Player>;
    decksById: Record<UUID, Deck>;
    onRemove?: (index: number) => void;
    index: number;
    getFormErrors: (
        index: number,
        fieldName: "playerId" | "deckId",
    ) => [string, ...string[]] | null;
}

export const DeckSelector = ({
    value,
    onChange,
    playersById,
    decksById,
    onRemove,
    index,
    getFormErrors,
}: DeckSelectorProps) => {
    const selectedPlayer = value?.playerId
        ? playersById[value.playerId]
        : undefined;
    const selectedDeck = value?.deckId ? decksById[value.deckId] : undefined;
    const players = Object.values(playersById);
    const decks = Object.values(decksById);

    const playerErrors = getFormErrors(index, "playerId");
    const deckErrors = getFormErrors(index, "deckId");

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
    ];

    const handlePlayerChange = (playerId: string | null) => {
        onChange(index, { playerId: playerId ?? undefined, deckId: undefined });
    };

    const handleDeckChange = (deckId: string | null) => {
        onChange(index, {
            playerId: selectedPlayer?.id,
            deckId: deckId ?? undefined,
        });
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
                        value={selectedPlayer?.id ?? ""}
                        onValueChange={handlePlayerChange}
                        items={players}
                    >
                        <ComboboxInput
                            showClear={!!selectedPlayer}
                            placeholder="Select a player"
                            value={selectedPlayer?.name}
                        />
                        <ComboboxContent>
                            <ComboboxEmpty>No players found.</ComboboxEmpty>
                            <ComboboxList>
                                {(player) => (
                                    <ComboboxItem
                                        key={player.id}
                                        value={player.id}
                                    >
                                        {player.name}
                                    </ComboboxItem>
                                )}
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>
                    {playerErrors && (
                        <p className="text-sm text-destructive mt-2">
                            {playerErrors[0]}
                        </p>
                    )}
                </div>

                {/* Deck Combobox */}
                <div className="flex-1">
                    <label className="text-sm font-medium text-foreground mb-2 block">
                        Deck
                    </label>
                    <Combobox
                        value={selectedDeck?.name ?? ""}
                        onValueChange={handleDeckChange}
                        disabled={!selectedPlayer}
                        items={availableDecks}
                    >
                        <ComboboxInput
                            showClear={!!selectedDeck}
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
                    {deckErrors && (
                        <p className="text-sm text-destructive mt-2">
                            {deckErrors[0]}
                        </p>
                    )}
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
