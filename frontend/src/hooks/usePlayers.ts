import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPlayer, getPlayers } from "@/api";
import type { Player } from "@/schemas";

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
            // Seed the list cache so lookups resolve before the refetch lands
            queryClient.setQueryData<Record<string, Player>>(
                ["players"],
                (old) => ({ ...(old ?? {}), [player.id]: player }),
            );
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
