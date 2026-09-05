from functools import lru_cache
from typing import Any

from pydantic import TypeAdapter
from sqlalchemy import JSON, TypeDecorator

__all__ = ["pydantic_json"]


@lru_cache
def pydantic_json(python_type: Any) -> type[TypeDecorator]:
    """Store `python_type` as JSON, parse it back into real objects on read.

    SQLModel maps scalars (int, str, datetime, Enum) to columns automatically but
    stops before arbitrary Pydantic types, so anything richer needs its own
    TypeDecorator. This builds one per type instead of hand-writing each.

        state: dict[int, PlayerHealth] = Field(
            default_factory=dict, sa_type=pydantic_json(dict[int, PlayerHealth])
        )

    Note the column is opaque to SQLAlchemy's change detection: mutating inside the
    loaded value emits no UPDATE. Assign the whole attribute instead.
    """
    adapter = TypeAdapter(python_type)

    class _PydanticJSON(TypeDecorator):
        impl = JSON
        cache_ok = True

        def process_bind_param(self, value: Any, dialect: Any) -> Any:
            if value is None:
                return None
            return adapter.dump_python(value, mode="json")

        def process_result_value(self, value: Any, dialect: Any) -> Any:
            if value is None:
                return None
            return adapter.validate_python(value)

    _PydanticJSON.__name__ = f"PydanticJSON[{python_type}]"
    return _PydanticJSON
