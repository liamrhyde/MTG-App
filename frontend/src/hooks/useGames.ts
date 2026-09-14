import {
    createGame,
    getGameDetail,
    getGameState,
    updateGameState,
} from "@/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GameState, GameStateChange } from "@/schemas";

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

export { useCreateGame, useGameDetail, useGameState, useUpdateGameState };
