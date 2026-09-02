import type { Player, CreatePlayer, Deck, CreateDeck } from "@/schemas";

export type { Player, CreatePlayer, Deck, CreateDeck };

const BASE_URL = "http://localhost:8000";

async function json<T>(res: Response): Promise<T> {
    if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
    }
    return res.json() as Promise<T>;
}

export const getPlayers = async (): Promise<Record<string, Player>> => {
    const res = await fetch(`${BASE_URL}/players`);
    return json<Record<string, Player>>(res);
};

export const createPlayer = async (input: CreatePlayer): Promise<Player> => {
    const res = await fetch(`${BASE_URL}/player`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });
    return json<Player>(res);
};

export const getDecks = async (): Promise<Record<number, Deck>> => {
    const res = await fetch(`${BASE_URL}/decks`);
    return json<Record<number, Deck>>(res);
};

export const createDeck = async (input: CreateDeck): Promise<Deck> => {
    const res = await fetch(`${BASE_URL}/deck`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });
    return json<Deck>(res);
};
