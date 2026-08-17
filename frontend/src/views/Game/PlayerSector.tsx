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
}

export const PlayerSector = ({
    playerId,
    player,
    deck,
    healthState,
    selectedPlayerId,
    onSelect,
    onHealthChange,
}: PlayerSectorProps) => (
    <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(playerId)}
        onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
                onSelect(playerId);
            }
        }}
        className={cn(
            "flex flex-col justify-between rounded-lg border p-3 sm:p-4 text-left transition-colors overflow-hidden min-w-0 min-h-0 cursor-pointer",
            selectedPlayerId === playerId
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
        <div className="self-end w-full mt-2" onClick={(e) => e.stopPropagation()}>
            <HealthDisplay
                value={healthState.health}
                onChange={onHealthChange || (() => {})}
                editable={!!selectedPlayerId}
            />
        </div>
    </div>
);
