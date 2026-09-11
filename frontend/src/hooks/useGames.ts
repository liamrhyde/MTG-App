import { createGame, getGame, updateGameState } from "@/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GameData, GameStateChange } from "@/schemas";

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

const useGame = (gameId: string) => {
    const query = useQuery({
        queryKey: ["game", gameId],
        queryFn: () => getGame(gameId),
    });
    return {
        gameData: query.data,
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
            queryClient.setQueryData<GameData>(["game", gameId], (current) =>
                current ? { ...current, gameState: newState } : current,
            );
        },
    });

    return {
        updateGameState: updateGameStateMutation.mutateAsync,
        isPending: updateGameStateMutation.isPending,
        error: updateGameStateMutation.error,
    } as const;
};

export { useCreateGame, useGame, useUpdateGameState };
