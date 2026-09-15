import type {
    Player,
    CreatePlayer,
    Deck,
    CreateDeck,
    CreateGame,
    GameDetail,
    GameState,
    GameStateChange,
} from "@/schemas";

const API_HOST = "localhost:8000";
const BASE_URL = `http://${API_HOST}`;
export const WS_BASE_URL = `ws://${API_HOST}`;

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

export const createGame = async (input: CreateGame): Promise<string> => {
    const res = await fetch(`${BASE_URL}/game`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });
    return json<string>(res);
};

export const getGameDetail = async (input: string): Promise<GameDetail> => {
    const res = await fetch(`${BASE_URL}/game/${input}`);
    return json<GameDetail>(res);
};

export const getGameState = async (input: string): Promise<GameState> => {
    const res = await fetch(`${BASE_URL}/game/${input}/state`);
    return json<GameState>(res);
};

export const updateGameState = async (
    gameId: string,
    change: GameStateChange,
): Promise<GameState> => {
    const res = await fetch(`${BASE_URL}/game/${gameId}/state`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(change),
    });
    return json<GameState>(res);
};
