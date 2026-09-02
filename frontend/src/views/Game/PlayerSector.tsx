import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Heart, Radiation, X } from "lucide-react";
import type { Deck, Player } from "@/schemas";
import type { PlayerGameState, PlayerHealthChange } from "@/schemas";
import { HealthDisplay } from "@/components/HealthDisplay";
import { CommanderDamageGrid } from "@/components/CommanderDamageGrid";
import { ButtonGroup } from "@/components/ui/button-group";

interface PlayerSectorProps {
    player: Player;
    deck: Deck;
    playerGameState: PlayerGameState;
    playerHealthChange: PlayerHealthChange | undefined;
    selectedPlayerId: string | null;
    onSelect: (playerId: string) => void;
    onHealthStateChange?: (
        targetPlayerId: string,
        healthType: keyof PlayerHealthChange,
        value: number,
    ) => void;
    onSubmit?: () => void;
    onCancel?: () => void;
}

export const PlayerSector = ({
    player,
    deck,
    playerGameState,
    playerHealthChange,
    selectedPlayerId,
    onSelect,
    onHealthStateChange,
    onSubmit,
    onCancel,
}: PlayerSectorProps) => {
    const playerId = player.id;
    const isSelected = selectedPlayerId === playerId;

    const handleHealthChange = (value: number) =>
        onHealthStateChange?.(playerId, "health", value);

    const handleCommanderChange = (value: number) => {
        const delta = value - (playerHealthChange?.commander ?? 0);
        onHealthStateChange?.(playerId, "commander", value);
        onHealthStateChange?.(
            playerId,
            "health",
            (playerHealthChange?.health ?? 0) - delta,
        );
    };

    const handlePoisonChange = (value: number) =>
        onHealthStateChange?.(playerId, "poison", value);

    return (
        <Card
            size="sm"
            className={cn(
                "min-w-0 min-h-0 text-left transition-colors",
                selectedPlayerId ? "cursor-default" : "cursor-pointer",
                isSelected
                    ? "bg-accent ring-2 ring-primary"
                    : "bg-muted/30 hover:bg-muted/50",
            )}
            onClick={() => onSelect(playerId)}
        >
            <CardHeader className="flex justify-between items-center m-0">
                <div className="flex gap-1 items-center min-h-7">
                    <p className="font-semibold truncate">{player.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                        {deck.name}
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
                    value={playerGameState.health}
                    changeValue={playerHealthChange?.health}
                    onChange={handleHealthChange}
                    editable={!!selectedPlayerId}
                />
                {selectedPlayerId ? (
                    <HealthDisplay
                        icon={Crown}
                        value={
                            playerGameState.commander?.[selectedPlayerId] ?? 0
                        }
                        changeValue={playerHealthChange?.commander}
                        onChange={handleCommanderChange}
                        editable={!!selectedPlayerId}
                    />
                ) : (
                    <CommanderDamageGrid
                        commanderDamage={playerGameState.commander}
                    />
                )}
                <HealthDisplay
                    icon={Radiation}
                    value={playerGameState.poison}
                    changeValue={playerHealthChange?.poison}
                    onChange={handlePoisonChange}
                    editable={!!selectedPlayerId}
                    className="flex-[2]"
                />
            </CardContent>
        </Card>
    );
};
