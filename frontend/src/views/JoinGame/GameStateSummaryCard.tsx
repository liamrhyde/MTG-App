import { Heart, Skull } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Deck, Game, Player } from "@/schemas";

interface GameStateSummaryCardProps {
    game: Game;
    playersById?: Record<string, Player>;
    decksById?: Record<number, Deck>;
    onClick: () => void;
}

export const GameStateSummaryCard = ({
    game,
    playersById,
    decksById,
    onClick,
}: GameStateSummaryCardProps) => {
    const playerCount = game.playerCount ?? game.gameMembers.length;
    const members = game.gameMembers.map(({ deckId, playerId }) => ({
        deckId,
        playerName: playersById?.[playerId]?.name ?? `Player #${playerId}`,
        deckName: decksById?.[deckId]?.name ?? `Deck #${deckId}`,
        health: game.state[deckId],
    }));

    return (
        <Card
            size="sm"
            role="button"
            tabIndex={0}
            onClick={onClick}
            className="cursor-pointer transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
            <CardHeader>
                <CardTitle>
                    Game {game.id} · {playerCount} players
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
                {members.map((member) => (
                    <div
                        key={member.deckId}
                        className="flex items-center justify-between gap-3"
                    >
                        <div className="flex min-w-0 items-baseline gap-2">
                            <span className="shrink-0 font-medium">
                                {member.playerName}
                            </span>
                            <span className="truncate text-xs text-muted-foreground">
                                {member.deckName}
                            </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-3 text-sm tabular-nums">
                            {!!member.health?.poison && (
                                <span className="flex items-center gap-1 text-muted-foreground">
                                    <Skull className="h-4 w-4" />
                                    <span className="w-[2ch] text-right">
                                        {member.health.poison}
                                    </span>
                                </span>
                            )}
                            <span className="flex items-center gap-1 font-semibold">
                                <Heart className="h-4 w-4" />
                                <span className="w-[3ch] text-right">
                                    {member.health?.health ?? "–"}
                                </span>
                            </span>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};
