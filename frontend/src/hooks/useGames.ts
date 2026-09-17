import {
    createGame,
    getGameDetail,
    getGameState,
    updateGameState,
    WS_BASE_URL,
} from "@/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
    GameState,
    GameStateChange,
    GameStateChangedMessage,
} from "@/schemas";
import { useCallback, useRef, useState } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";

const useCreateGame = () => {
    const queryClient = useQueryClient();
    const createGameMutation = useMutation({
        mutationFn: createGame,
        onSuccess: (newGameId) => {
            // Seed the list cache so lookups resolve before the refetch lands
            queryClient.setQueryData<string>(["newGameId"], newGameId);
            // Invalidate decks query, as we have a new list now
            queryClient.invalidateQueries({ queryKey: ["decks"] });
        },
    });

    return {
        createGame: createGameMutation.mutateAsync,
        isPending: createGameMutation.isPending,
        error: createGameMutation.error,
    } as const;
};

const useGameDetail = (gameId: string) => {
    const query = useQuery({
        queryKey: ["game", gameId, "detail"],
        queryFn: () => getGameDetail(gameId),
    });
    return {
        gameDetail: query.data,
        isLoading: query.isLoading || query.isFetching,
        error: query.error,
    };
};

const useGameState = (gameId: string) => {
    const query = useQuery({
        queryKey: ["game", gameId, "state"],
        queryFn: () => getGameState(gameId),
    });
    return {
        gameState: query.data,
        isLoading: query.isLoading || query.isFetching,
        error: query.error,
    };
};

const useUpdateGameState = (gameId: string) => {
    const queryClient = useQueryClient();
    const updateGameStateMutation = useMutation({
        mutationFn: (change: GameStateChange) =>
            updateGameState(gameId, change),
        onSuccess: (newState) => {
            queryClient.setQueryData<GameState>(
                ["game", gameId, "state"],
                newState,
            );
        },
    });

    return {
        updateGameState: updateGameStateMutation.mutateAsync,
        isPending: updateGameStateMutation.isPending,
        error: updateGameStateMutation.error,
    } as const;
};

type GameChangeListener = (msg: GameStateChangedMessage) => void;

export const useGameSocket = (gameId: string) => {
    const queryClient = useQueryClient();
    const [gameChanges, setGameChanges] = useState<GameStateChangedMessage[]>(
        [],
    );
    const listenersRef = useRef(new Set<GameChangeListener>());

    const handleMessage = useCallback(
        (msg: GameStateChangedMessage) => {
            if (msg.type !== "gameStateChanged") return;
            queryClient.setQueryData<GameState>(
                ["game", gameId, "state"],
                msg.gameState,
            );
            setGameChanges((prev) => [...prev, msg]);
            listenersRef.current.forEach((listener) => listener(msg));
        },
        [gameId, queryClient],
    );

    useWebSocket<GameStateChangedMessage>(
        `${WS_BASE_URL}/ws/game/${gameId}`,
        handleMessage,
    );

    const subscribe = useCallback((listener: GameChangeListener) => {
        listenersRef.current.add(listener);
        return () => listenersRef.current.delete(listener);
    }, []);

    return { gameChanges, subscribe };
};

export { useCreateGame, useGameDetail, useGameState, useUpdateGameState };
