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

Two types of test, split by directory:

- `tests/unit/` — tightly focused on a single unit of functionality. One
  `Test<Subject>` class per topic, with explicit test methods for each
  distinct behaviour.
- `tests/integration/` — focused on functionality, not on any particular
  domain shape. Stays context-agnostic: no dependency on app models (e.g.
  `Player`) or realistic data, since it's exercising plumbing (DB session,
  dependency wiring) rather than business logic.

Every test should read as three explicit stages — Set, Gather, Assert:

```python
def test_returns_existing_player(self, session, repository):
    # Set
    player = Player(name="Alice")
    session.add(player)
    session.commit()

    # Gather
    result = repository.get_player(player.id)

    # Assert
    assert result is not None
    assert result.name == "Alice"
```

A test that interleaves these stages (asserting mid-setup, gathering
mid-assert, etc.) is usually testing more than one unit — treat that as a
signal to split it.

Exception: an `assert` needed purely to narrow a type for the type checker
(e.g. `assert result is not None` before accessing an attribute the checker
sees as `Optional`) is acceptable inside Set or Gather. Mark it explicitly
with a `# narrows type` comment so it reads as plumbing, not a real
assertion stage.

### Running

```
pytest
```

Run one type only:

```
pytest tests/unit
pytest tests/integration
```

Run a single file, class, or test:

```
pytest tests/unit/test_repository.py::TestGetPlayer::test_returns_existing_player
```
