from collections import defaultdict

from fastapi import WebSocket, WebSocketDisconnect


class ConnectionManager:
    """Tracks websocket subscribers per game and broadcasts to them.

    In-process `dict[int, set[WebSocket]]` — correct for a single uvicorn
    worker only. A multi-worker upgrade would swap the internals for Redis
    pub/sub behind these same three methods.
    """

    def __init__(self):
        self._rooms: dict[int, set[WebSocket]] = defaultdict(set)

    async def connect(self, game_id: int, ws: WebSocket):
        await ws.accept()
        self._rooms[game_id].add(ws)

    def disconnect(self, game_id: int, ws: WebSocket):
        self._rooms[game_id].discard(ws)
        if not self._rooms[game_id]:
            del self._rooms[game_id]

    async def broadcast(self, game_id: int, payload: dict):
        dead = []
        for ws in list(self._rooms.get(game_id, ())):
            try:
                await ws.send_json(payload)
            except (WebSocketDisconnect, RuntimeError):
                dead.append(ws)
        for ws in dead:
            self.disconnect(game_id, ws)
