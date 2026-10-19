import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty,
    ComboboxCollection,
} from "@/components/ui/combobox";
import { Spinner } from "@/components/ui/spinner";
import { GameStateSummaryCard } from "@/views/JoinGame/GameStateSummaryCard";
import { usePlayers } from "@/hooks/usePlayers";
import { useDecks } from "@/hooks/useDecks";
import { useGames } from "@/hooks/useGames";
import type { Player } from "@/schemas";

export const JoinGame = () => {
    const [, navigate] = useLocation();
    const [playerId, setPlayerId] = useState<number | undefined>();

    const { players } = usePlayers();
    const { decks } = useDecks();
    const { games, isLoading } = useGames({ status: "active", playerId });

    const selectedPlayer =
        playerId !== undefined ? players?.[playerId] : undefined;
    const gameList = Object.values(games ?? {});

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header + player filter */}
            <div className="p-6 pb-4">
                <div className="flex items-center gap-2 mb-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate("/")}
                        aria-label="Back"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-3xl font-bold">Join Game</h1>
                </div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                    Player
                </label>
                <Combobox
                    value={selectedPlayer?.id ?? null}
                    onValueChange={(id: number | null) =>
                        setPlayerId(id ?? undefined)
                    }
                    items={Object.values(players ?? {})}
                    autoHighlight
                >
                    <ComboboxInput
                        showClear={!!selectedPlayer}
                        placeholder="All players"
                        value={selectedPlayer?.name}
                    />
                    <ComboboxContent>
                        <ComboboxEmpty>No players found.</ComboboxEmpty>
                        <ComboboxList>
                            <ComboboxCollection>
                                {(player: Player) => (
                                    <ComboboxItem
                                        key={player.id}
                                        value={player.id}
                                    >
                                        {player.name}
                                    </ComboboxItem>
                                )}
                            </ComboboxCollection>
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
            </div>

            {/* Game list - scrollable */}
            <div className="flex-1 overflow-y-auto p-1">
                <div className="px-6 pb-6 space-y-4">
                    {isLoading && !games ? (
                        <div className="flex justify-center py-12">
                            <Spinner />
                        </div>
                    ) : gameList.length === 0 ? (
                        <p className="py-12 text-center text-muted-foreground">
                            No games found
                        </p>
                    ) : (
                        gameList.map((game) => (
                            <GameStateSummaryCard
                                key={game.id}
                                game={game}
                                playersById={players}
                                decksById={decks}
                                onClick={() => navigate(`/game/${game.id}`)}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
