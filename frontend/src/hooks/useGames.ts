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
import { useCallback, useEffect, useRef, useState } from "react";
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

export const useGameSocket = (gameId: string) => {
    const queryClient = useQueryClient();
    const [lastMessage, setLastMessage] =
        useState<GameStateChangedMessage | null>(null);
    const dismissTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const handleMessage = useCallback(
        (msg: GameStateChangedMessage) => {
            if (msg.type !== "gameStateChanged") return;
            queryClient.invalidateQueries({
                queryKey: ["game", gameId, "state"],
            });
            setLastMessage(msg);
            clearTimeout(dismissTimeoutRef.current);
            dismissTimeoutRef.current = setTimeout(
                () => setLastMessage(null),
                3000,
            );
        },
        [gameId, queryClient],
    );

    useWebSocket<GameStateChangedMessage>(
        `${WS_BASE_URL}/ws/game/${gameId}`,
        handleMessage,
    );

    useEffect(() => () => clearTimeout(dismissTimeoutRef.current), []);

    return { lastMessage };
};

export { useCreateGame, useGameDetail, useGameState, useUpdateGameState };
