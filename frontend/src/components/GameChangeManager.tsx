import { useEffect } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import type { GameStateChangedMessage } from "@/schemas";

interface GameChangeManagerProps {
    changes: GameStateChangedMessage[];
    subscribe: (listener: (msg: GameStateChangedMessage) => void) => () => void;
}

export const GameChangeManager = ({ subscribe }: GameChangeManagerProps) => {
    useEffect(() => {
        const unsubscribe = subscribe((msg) => {
            toast(JSON.stringify(msg.change));
        });
        return unsubscribe;
    }, [subscribe]);

    return <Toaster />;
};
