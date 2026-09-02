import { Crown } from "lucide-react";
import { HealthDisplay } from "./HealthDisplay";

interface CommanderDamageGridProps {
    commanderDamage: Record<string, number>;
}

export const CommanderDamageGrid = ({
    commanderDamage,
}: CommanderDamageGridProps) => {
    return (
        <div className="flex flex-3 gap-2 items-center">
            <Crown className="h-4 w-4" />
            <div className="flex flex-1 flex-wrap gap-1 h-full">
                {/* TODO: Consider explicitly handling all players vs relying on commanderDamage keys */}
                {Object.entries(commanderDamage).map(([opponentId, damage]) => (
                    <HealthDisplay
                        key={opponentId}
                        editable={false}
                        value={damage}
                        label={opponentId}
                    />
                ))}
            </div>
        </div>
    );
};
