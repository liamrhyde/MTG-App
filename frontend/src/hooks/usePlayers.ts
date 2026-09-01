import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPlayer, getPlayers } from "@/api";

export function usePlayers() {
    const query = useQuery({
        queryKey: ["players"],
        queryFn: () => getPlayers(),
    });
    return {
        players: query.data,
        isLoading: query.isLoading || query.isFetching,
        error: query.error,
    };
}

export function useCreatePlayer() {
    const queryClient = useQueryClient();
    const createPlayerMutation = useMutation({
        mutationFn: createPlayer,
        onSuccess: (player) => {
            queryClient.setQueryData(["player", player.id], player);
            // Invalidate players query, as we have a new list now
            queryClient.invalidateQueries({ queryKey: ["players"] });
        },
    });

    return {
        createPlayer: createPlayerMutation.mutateAsync,
        isPending: createPlayerMutation.isPending,
        error: createPlayerMutation.error,
    } as const;
}
