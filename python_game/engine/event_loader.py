"""Carga eventos JSON agrupados por acto o capítulo."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from .event_system import EventDataError, EventDefinition, event_from_json


class EventLoader:
    def __init__(self, events_dir: str | Path):
        self.events_dir = Path(events_dir)

    def load_file(self, filename: str) -> dict[str, EventDefinition]:
        path = self.events_dir / filename
        if not path.is_file():
            raise EventDataError(f"No existe el archivo de eventos: {path}")
        try:
            payload: Any = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            raise EventDataError(f"JSON inválido en {path}: {exc}") from exc
        raw_events = payload.get("events") if isinstance(payload, dict) else None
        if not isinstance(raw_events, list):
            raise EventDataError(f"{path}: se requiere una lista events")
        definitions = [event_from_json(item) for item in raw_events]
        ids = [event.event_id for event in definitions]
        if len(ids) != len(set(ids)):
            raise EventDataError(f"{path}: hay ids de eventos repetidos")
        return {event.event_id: event for event in definitions}
