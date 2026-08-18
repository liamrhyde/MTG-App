import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Deck, Player, UUID } from "@/views/NewGame/schemas";
import type { PlayerHealthState } from "@/views/Game/schemas";
import { HealthDisplay } from "@/components/HealthDisplay";
import { ButtonGroup } from "@/components/ui/button-group";

interface PlayerSectorProps {
    playerId: UUID;
    player: Player;
    deck: Deck;
    healthState: PlayerHealthState;
    selectedPlayerId: UUID | null;
    onSelect: (playerId: UUID) => void;
    onHealthChange?: (health: number) => void;
    onSubmit?: () => void;
    onCancel?: () => void;
}

export const PlayerSector = ({
    playerId,
    player,
    deck,
    healthState,
    selectedPlayerId,
    onSelect,
    onHealthChange,
    onSubmit,
    onCancel,
}: PlayerSectorProps) => {
    const isSelected = selectedPlayerId === playerId;

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
            <CardContent className="flex flex-col justify-between grow">
                <div className="self-end w-full">
                    <HealthDisplay
                        value={healthState.health}
                        onChange={onHealthChange || (() => {})}
                        editable={!!selectedPlayerId}
                    />
                </div>
            </CardContent>
        </Card>
    );
};
