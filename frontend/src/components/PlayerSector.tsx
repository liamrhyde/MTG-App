import { cn } from "@/lib/utils";
import type { Deck, Player, UUID } from "@/views/NewGame/schemas";
import type { PlayerGameState } from "@/views/GameView";

interface PlayerSectorProps {
	player: Player;
	deck: Deck;
	gameState: PlayerGameState;
	isSelected: boolean;
	onSelect: (playerId: UUID) => void;
}

export const PlayerSector = ({
	player,
	deck,
	gameState,
	isSelected,
	onSelect,
}: PlayerSectorProps) => (
	<button
		type="button"
		onClick={() => onSelect(player.id)}
		className={cn(
			"flex flex-col justify-between rounded-lg border p-3 sm:p-4 text-left transition-colors overflow-hidden min-w-0 min-h-0",
			isSelected
				? "border-primary ring-4 ring-primary bg-accent"
				: "border-border bg-muted/30 hover:bg-muted/50",
		)}
	>
		<div className="min-w-0">
			<p className="font-semibold truncate">{player.name}</p>
			<p className="text-sm text-muted-foreground truncate">{deck.name}</p>
		</div>
		<div className="self-end text-3xl sm:text-4xl font-bold tabular-nums">
			{gameState.health}
		</div>
	</button>
);
