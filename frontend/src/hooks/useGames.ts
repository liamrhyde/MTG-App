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
import { useEffect } from "react";

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
    useEffect(() => {
        const ws = new WebSocket(`${WS_BASE_URL}/ws/game/${gameId}`);
        ws.onmessage = (event) => {
            const msg: GameStateChangedMessage = JSON.parse(event.data);
            console.log(msg.type);
            if (msg.type === "gameStateChanged") {
                queryClient.invalidateQueries({
                    queryKey: ["game", gameId, "state"],
                });
            }
        };
        return () => ws.close();
    }, [gameId, queryClient]);
};

export { useCreateGame, useGameDetail, useGameState, useUpdateGameState };
