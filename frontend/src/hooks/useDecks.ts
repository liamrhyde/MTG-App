import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createDeck, getDecks } from "@/api";
import type { Deck, UUID } from "@/views/NewGame/schemas";

export function useDecks() {
    const query = useQuery({
        queryKey: ["decks"],
        queryFn: () => getDecks(),
    });
    return {
        decks: query.data,
        isLoading: query.isLoading || query.isFetching,
        error: query.error,
    };
}

export function useCreateDeck() {
    const queryClient = useQueryClient();
    const createDeckMutation = useMutation({
        mutationFn: createDeck,
        onSuccess: (deck) => {
            // Seed the list cache so lookups resolve before the refetch lands
            queryClient.setQueryData<Record<UUID, Deck>>(
                ["decks"],
                (old) => ({ ...(old ?? {}), [deck.id]: deck }),
            );
            // Invalidate decks query, as we have a new list now
            queryClient.invalidateQueries({ queryKey: ["decks"] });
        },
    });

    return {
        createDeck: createDeckMutation.mutateAsync,
        isPending: createDeckMutation.isPending,
        error: createDeckMutation.error,
    } as const;
}
