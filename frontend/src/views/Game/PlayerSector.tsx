import { cn } from "@/lib/utils";
import type { Deck, Player, UUID } from "@/views/NewGame/schemas";
import type { PlayerHealthState } from "@/views/Game/schemas";
import { HealthDisplay } from "@/components/HealthDisplay";

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

    const handleClick = () => {
        onSelect(playerId);
    };

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={handleClick}
            className={cn(
                "flex flex-col justify-between rounded-lg border p-3 sm:p-4 text-left transition-colors overflow-hidden min-w-0 min-h-0",
                selectedPlayerId ? "cursor-default" : "cursor-pointer",
                isSelected
                    ? "border-primary ring-4 ring-primary bg-accent"
                    : "border-border bg-muted/30 hover:bg-muted/50",
            )}
        >
            <div className="min-w-0">
                <p className="font-semibold truncate">{player.name}</p>
                <p className="text-sm text-muted-foreground truncate">
                    {deck.name}
                </p>
            </div>
            <div
                className="self-end w-full mt-2"
                onClick={(e) => e.stopPropagation()}
            >
                <HealthDisplay
                    value={healthState.health}
                    onChange={onHealthChange || (() => {})}
                    editable={!!selectedPlayerId}
                />
            </div>
            {isSelected && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSubmit?.();
                        }}
                        className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                        Submit
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onCancel?.();
                        }}
                        className="flex-1 px-3 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors text-sm font-medium"
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};
