import { Crown } from "lucide-react";
import { HealthDisplay } from "./HealthDisplay";
import type { GameDeck } from "@/schemas";

interface CommanderDamageGridProps {
    currentDeckId: number;
    commanderDamage: Record<number, number>;
    gameMembers: Record<number, GameDeck>;
}

export const CommanderDamageGrid = ({
    currentDeckId,
    commanderDamage,
    gameMembers,
}: CommanderDamageGridProps) => {
    return (
        <div className="flex flex-3 gap-2 items-center">
            <Crown className="h-4 w-4" />
            <div className="flex flex-1 flex-wrap gap-1 h-full">
                {Object.values(gameMembers)
                    .filter((m) => m.deckId === currentDeckId)
                    .map((member) => (
                        <HealthDisplay
                            key={`${currentDeckId}-${member.deckId}`}
                            editable={false}
                            value={commanderDamage[member.deckId]}
                            label={member.playerName}
                        />
                    ))}
            </div>
        </div>
    );
};
