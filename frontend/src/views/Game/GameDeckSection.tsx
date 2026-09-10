import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Heart, Radiation, X } from "lucide-react";
import type { GameDeck } from "@/schemas";
import type { DeckGameState, DeckHealthChange } from "@/schemas";
import { HealthDisplay } from "@/components/HealthDisplay";
import { CommanderDamageGrid } from "@/components/CommanderDamageGrid";
import { ButtonGroup } from "@/components/ui/button-group";

interface GameDeckSectionProps {
    gameDeckId: number;
    memberData: Record<number, GameDeck>;
    deckGameState: DeckGameState;
    deckHealthChange: DeckHealthChange | undefined;
    selectedDeckId: number | null;
    onSelect: (deckId: number) => void;
    onHealthStateChange?: (
        targetDeckId: number,
        healthType: keyof DeckHealthChange,
        value: number,
    ) => void;
    onSubmit?: () => void;
    onCancel?: () => void;
}

export const GameDeckSection = ({
    gameDeckId,
    memberData,
    deckGameState,
    deckHealthChange,
    selectedDeckId,
    onSelect,
    onHealthStateChange,
    onSubmit,
    onCancel,
}: GameDeckSectionProps) => {
    const isSelected = selectedDeckId === gameDeckId;

    const gameDeck = memberData[gameDeckId] ?? {};

    const handleHealthChange = (value: number) =>
        onHealthStateChange?.(gameDeckId, "health", value);

    const handleCommanderChange = (value: number) => {
        const delta = value - (deckHealthChange?.commander ?? 0);
        onHealthStateChange?.(gameDeckId, "commander", value);
        onHealthStateChange?.(
            gameDeckId,
            "health",
            (deckHealthChange?.health ?? 0) - delta,
        );
    };

    const handlePoisonChange = (value: number) =>
        onHealthStateChange?.(gameDeckId, "poison", value);

    return (
        <Card
            size="sm"
            className={cn(
                "min-w-0 min-h-0 text-left transition-colors",
                selectedDeckId ? "cursor-default" : "cursor-pointer",
                isSelected
                    ? "bg-accent ring-2 ring-primary"
                    : "bg-muted/30 hover:bg-muted/50",
            )}
            onClick={() => onSelect(gameDeckId)}
        >
            <CardHeader className="flex justify-between items-center m-0">
                <div className="flex gap-1 items-center min-h-7">
                    <p className="font-semibold truncate">
                        {gameDeck.playerName}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                        {gameDeck.deckName}
                    </p>
                </div>
                <div className="flex flex-1 justify-end">
                    {isSelected && (
                        <ButtonGroup>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSubmit?.();
                                }}
                            >
                                Submit
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCancel?.();
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </ButtonGroup>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 lg:gap-3 justify-between grow">
                <HealthDisplay
                    icon={Heart}
                    value={deckGameState.health}
                    changeValue={deckHealthChange?.health}
                    onChange={handleHealthChange}
                    editable={!!selectedDeckId}
                />
                {selectedDeckId ? (
                    <HealthDisplay
                        icon={Crown}
                        value={deckGameState.commander?.[selectedDeckId] ?? 0}
                        changeValue={deckHealthChange?.commander}
                        onChange={handleCommanderChange}
                        editable={!!selectedDeckId}
                    />
                ) : (
                    <CommanderDamageGrid
                        currentDeckId={gameDeckId}
                        commanderDamage={deckGameState.commander}
                        gameMembers={memberData}
                    />
                )}
                <HealthDisplay
                    icon={Radiation}
                    value={deckGameState.poison}
                    changeValue={deckHealthChange?.poison}
                    onChange={handlePoisonChange}
                    editable={!!selectedDeckId}
                    className="flex-[2]"
                />
            </CardContent>
        </Card>
    );
};
