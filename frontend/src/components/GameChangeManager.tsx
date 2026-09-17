import { useEffect } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import type { GameDetail, GameStateChangedMessage } from "@/schemas";
import { Crown, Heart, Radiation, Skull } from "lucide-react";
import { Card, CardContent, CardHeader } from "./ui/card";

interface GameChangeManagerProps {
    changes: GameStateChangedMessage[];
    gameDetail?: GameDetail;
    subscribe: (listener: (msg: GameStateChangedMessage) => void) => () => void;
}

const getPlayerDeckName = (gameDetail: GameDetail, deckId: number): string => {
    const gameDeck = gameDetail.gameMembers[deckId];
    if (!gameDeck) return `Deck ${deckId}`;
    return `${gameDeck.playerName} (${gameDeck.deckName})`;
};

export const GameChangeManager = ({
    gameDetail,
    subscribe,
}: GameChangeManagerProps) => {
    useEffect(() => {
        const unsubscribe = subscribe((msg) => {
            if (!gameDetail) return;

            const { change } = msg;
            const sourceInfo = getPlayerDeckName(gameDetail, change.sourceDeck);

            // Toast for each target change
            toast.custom(() => (
                <Card className="rounded-md p-3 text-sm w-sm">
                    <CardHeader>
                        <span className="font-semibold">{sourceInfo} →</span>
                    </CardHeader>
                    <CardContent>
                        {Object.entries(change.targets).map(
                            ([deckId, healthChange]) => (
                                <div
                                    className="flex flex-row justify-evenly align-center"
                                    key={deckId}
                                >
                                    <div className="flex flex-1">
                                        {
                                            gameDetail.gameMembers[
                                                Number(deckId)
                                            ].playerName
                                        }
                                    </div>
                                    <Skull
                                        className={`size-4 ${!healthChange.eliminated ? "invisible" : ""}`}
                                    />
                                    <div className="flex flex-row flex-1 justify-evenly items-center">
                                        <Heart className="size-4" />
                                        {healthChange.health}
                                    </div>
                                    <div className="flex flex-row flex-1 justify-evenly items-center">
                                        <Crown className="size-4" />
                                        {healthChange.commander}
                                    </div>
                                    <div className="flex flex-row flex-1 justify-evenly items-center">
                                        <Radiation className="size-4" />
                                        {healthChange.poison}
                                    </div>
                                </div>
                            ),
                        )}
                    </CardContent>
                </Card>
            ));
        });
        return unsubscribe;
    }, [subscribe, gameDetail]);

    return <Toaster />;
};
