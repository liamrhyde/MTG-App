import { createGame, getGame } from "@/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

export { useCreateGame, useGame };
