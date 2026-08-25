# Backend

API for tracking Magic: The Gathering deck Elo, damage, eliminations, and game history.

## Running

FastAPI command line ships within the package - you can interact directly from within the venv

```
source .venv/bin/activate
```

If using uv (suggested):

```
uv sync
```

If using pip:

```
pip install .
```

FastAPI server can then be run from within the venv. This will use default ports:

```
fastapi dev src/backend/main
```

## Structure

### `db`

SQLite access via SQLModel. Only `init_db` and `SessionDep` are exported —
engine, raw `Session` creation, and table records stay internal.

Routes/repository should depend on `SessionDep`, never construct or import
a `Session` directly.

### `repository`

Domain-scoped wrapper around a session — routes call `Repository` methods
(`get_player`, etc.) instead of touching the session directly. Exposed via
`RepositoryDep`.

Repository still needs to be wired up to the lifecycle of the provided Session - currently, no way of refreshing models and committing data to the database.
This will be implemented with the first 'write' method of Repository

## Testing

TODO.
