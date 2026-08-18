import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Deck, Player, UUID } from "@/views/NewGame/schemas";
import type { PlayerGameState, PlayerHealthChange } from "@/views/Game/schemas";
import { HealthDisplay } from "@/components/HealthDisplay";
import { ButtonGroup } from "@/components/ui/button-group";
import { InputGroup, InputGroupText } from "@/components/ui/input-group";

interface PlayerSectorProps {
    player: Player;
    deck: Deck;
    playerGameState: PlayerGameState;
    playerHealthChange: PlayerHealthChange | undefined;
    selectedPlayerId: UUID | null;
    onSelect: (playerId: UUID) => void;
    onHealthStateChange?: (
        targetPlayerId: UUID,
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
            <CardContent className="flex flex-col justify-between grow">
                <HealthDisplay
                    label="H"
                    value={playerGameState.health}
                    changeValue={playerHealthChange?.health}
                    onChange={handleHealthChange}
                    editable={!!selectedPlayerId}
                />
                {selectedPlayerId ? (
                    <HealthDisplay
                        label="C"
                        value={
                            playerGameState.commander?.[selectedPlayerId] ?? 0
                        }
                        changeValue={playerHealthChange?.commander}
                        onChange={handleCommanderChange}
                        editable={!!selectedPlayerId}
                    />
                ) : (
                    <InputGroup className="justify-center">
                        <InputGroupText>
                            Commander Health Values Here
                        </InputGroupText>
                    </InputGroup>
                )}
                <HealthDisplay
                    label="P"
                    value={playerGameState.poison}
                    changeValue={playerHealthChange?.poison}
                    onChange={handlePoisonChange}
                    editable={!!selectedPlayerId}
                />
            </CardContent>
        </Card>
    );
};
