mtg_elo_tracker.py is the main function that calculates ELO, samples decks, pulls in stats. 
Database right now is .txt files
backend is useing Fastapi and uvicorn to host on http://127.0.0.1:8000/docs#/
front end is using vite and node.js to host on http://localhost:5173/ using React

Next step: Connect React to FastAPI
Then start building pages

## Live game updates (websocket)

Game state pushes over a websocket as changes happen. `useGameSocket`
writes the pushed state straight into the query cache (no refetch) and
separately publishes each raw change event to a small pub/sub — any
component can call `subscribe(listener)` to react to live changes without
the socket hook knowing or caring what they do with them. `GameChangeManager`
is the current subscriber: it turns each live change into a Sonner toast.
Timeout/dismissal is owned entirely by Sonner, not the socket layer.
