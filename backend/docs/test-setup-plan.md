# Test setup for backend — Part 2: unit tests for Repository (concrete test-DB fixtures)

## Context
Backend (`backend/`) has no test infrastructure yet — no `tests/` dir, no `pytest` dependency, no pytest config in `pyproject.toml`.

User identified three kinds of tests wanted eventually:
1. Integration tests — real engine→session→repository wiring end to end. Considered, but `get_session`/`get_repository` are thin passthroughs with little logic to break, so skipped for now in favor of higher-value work.
2. **Unit tests — per-function tests on `Repository` (and future service layers). This plan.**
3. Endpoint tests — hit FastAPI routes via `TestClient`. Deferred.

For (2), the user wants **concrete fixtures over mocking**: tests should read/write against a real (in-memory, disposable) test database, and reserve mocking strictly for external calls that aren't the current focus of a test (e.g. a future service layer hitting a third-party API). `Repository` has no such external dependency today — it's pure DB access — so this suite uses zero mocks.

`backend/repository.py` currently exposes:
- `Repository.get_player(player_id)` → `self.session.get(Player, player_id)`
- `get_repository(session)` → generator yielding `Repository(session)` (the FastAPI dependency)

The project is `uv`-managed with a `src/` layout (`src/backend`, `src/db`); the venv already has a `backend.pth` pointing `sys.path` at `src/`, so `db` and `backend` import as top-level packages the same way the app code does.

## Approach
- In-memory SQLite (`sqlite://`) with `StaticPool` + `check_same_thread: False` (mirrors `connect_args` already used in `db/engine.py`) so one connection is shared per test, and `SQLModel.metadata.create_all` gives a real, disposable schema — no mocking of `Session` or its methods.
- Each test seeds real rows through the session, then asserts on what `Repository` actually returns — concrete input, concrete output.
- Place under `tests/unit/` so later Part 1 (integration) and Part 3 (endpoint) suites get their own sibling dirs without reshuffling this one. (With no mocking here, the unit/integration line is really about scope — one function vs. the full app stack — rather than mocked vs. real.)

## Changes

**1. `backend/pyproject.toml`**
- Add `pytest` to `[dependency-groups].dev` (via `uv add --dev pytest`). `pyrefly` is already there from an external change — leave it, just add `pytest` alongside it.
- Add:
  ```toml
  [tool.pytest.ini_options]
  pythonpath = ["src"]
  testpaths = ["tests"]
  ```
  (`pythonpath` makes imports robust even if the editable-install `.pth` isn't present, e.g. fresh CI checkout before `uv sync`.)

**2. `backend/tests/unit/conftest.py`** (new)
- `test_engine` fixture: in-memory `StaticPool` engine, `SQLModel.metadata.create_all`, function-scoped (fresh per test, no state leaks).
- `session` fixture: `Session(test_engine)`, yielded per test.
- `repository` fixture: `Repository(session)`.

**3. `backend/tests/unit/test_repository.py`** (new)
- `test_get_player_returns_existing_player`: insert a real `Player(name="Alice")` via the `session` fixture, commit + refresh to get its id, call `repository.get_player(id)`, assert the returned row's `id`/`name` match what was inserted.
- `test_get_player_returns_none_for_missing_id`: no rows inserted, assert `repository.get_player(999) is None`.
- `test_get_repository_yields_repository_wrapping_session`: drive the `get_repository(session)` generator with `next()`, assert the yielded `Repository`'s `.session` is that same real session, and that it can immediately query through it (e.g. `get_player` on a just-inserted row).

## Verification
- `cd backend && uv run pytest -v` — all new tests pass.
- No real DB file touched — everything runs against a fresh in-memory SQLite DB per test.
