import { createGame } from "@/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

export { useCreateGame };
