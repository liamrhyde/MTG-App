const BASE_URL = "http://localhost:8000";

// TODO: Update base schemas with these definitions
export interface Player {
    id: string;
    name: string;
}

export interface CreatePlayer {
    name: string;
}

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
