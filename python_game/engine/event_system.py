"""Sistema de eventos narrativos declarativos para Runas Vikingas RPG."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable, Iterable

from .map_loader import Transfer


class EventDataError(ValueError):
    """Evento mal formado o acción desconocida."""


@dataclass
class GameState:
    """Estado persistente mínimo que puede consultar y modificar un evento."""

    flags: set[str] = field(default_factory=set)
    runes_read: set[str] = field(default_factory=set)
    current_map: str = "horgr"
    player_x: int = 0
    player_y: int = 0
    facing: str = "down"


@dataclass(frozen=True)
class DialogueLine:
    speaker: str
    text: str
    portrait: str | None = None


@dataclass(frozen=True)
class EventResult:
    consumed: bool = True
    dialogue: tuple[DialogueLine, ...] = ()
    message: str | None = None
    transfer: Transfer | None = None
    completed: bool = False


@dataclass(frozen=True)
class EventDefinition:
    event_id: str
    trigger: str
    actions: tuple[dict[str, Any], ...]
    once: bool = False
    condition_flag: str | None = None


class EventSystem:
    """Interpreta acciones JSON y devuelve resultados que la escena puede renderizar."""

    def __init__(self, state: GameState | None = None, transfer_lookup: Callable[[str], Transfer | None] | None = None):
        self.state = state or GameState()
        self.transfer_lookup = transfer_lookup or (lambda _transfer_id: None)
        self._completed: set[str] = set()
        self._dialogue_queue: list[DialogueLine] = []

    @property
    def dialogue_queue(self) -> tuple[DialogueLine, ...]:
        return tuple(self._dialogue_queue)

    def clear_dialogue(self) -> None:
        self._dialogue_queue.clear()

    def can_trigger(self, event: EventDefinition) -> bool:
        if event.once and event.event_id in self._completed:
            return False
        if event.condition_flag and event.condition_flag not in self.state.flags:
            return False
        return True

    def run(self, event: EventDefinition) -> EventResult:
        if not self.can_trigger(event):
            return EventResult(consumed=False, message=f"El evento {event.event_id} no está disponible.")
        dialogues: list[DialogueLine] = []
        message: str | None = None
        transfer: Transfer | None = None
        completed = False
        for index, action in enumerate(event.actions):
            if not isinstance(action, dict) or "type" not in action:
                raise EventDataError(f"{event.event_id}.actions[{index}]: se requiere type")
            action_type = action["type"]
            if action_type == "dialogue":
                dialogues.extend(self._dialogue(action, event.event_id, index))
            elif action_type == "set_flag":
                flag = self._text(action, "flag", event.event_id, index)
                self.state.flags.add(flag)
            elif action_type == "clear_flag":
                flag = self._text(action, "flag", event.event_id, index)
                self.state.flags.discard(flag)
            elif action_type == "read_rune":
                rune = self._text(action, "rune", event.event_id, index).upper()
                self.state.runes_read.add(rune)
                message = action.get("message", f"La runa {rune} deja una presión en el aire.")
            elif action_type == "message":
                message = self._text(action, "text", event.event_id, index)
            elif action_type == "transfer":
                transfer_id = self._text(action, "transfer_id", event.event_id, index)
                transfer = self.transfer_lookup(transfer_id)
                if transfer is None:
                    raise EventDataError(f"{event.event_id}: transferencia inexistente '{transfer_id}'")
                self.state.current_map = transfer.target_map
                self.state.player_x = transfer.target_x
                self.state.player_y = transfer.target_y
                self.state.facing = transfer.facing
            elif action_type == "complete":
                completed = True
            else:
                raise EventDataError(f"{event.event_id}: acción desconocida '{action_type}'")
        if dialogues:
            self._dialogue_queue.extend(dialogues)
        if event.once:
            self._completed.add(event.event_id)
        return EventResult(True, tuple(dialogues), message, transfer, completed)

    def advance_dialogue(self) -> DialogueLine | None:
        if not self._dialogue_queue:
            return None
        return self._dialogue_queue.pop(0)

    def _dialogue(self, action: dict[str, Any], event_id: str, index: int) -> tuple[DialogueLine, ...]:
        lines = action.get("lines")
        if not isinstance(lines, list) or not lines:
            raise EventDataError(f"{event_id}.actions[{index}].lines debe ser una lista no vacía")
        result: list[DialogueLine] = []
        for line_index, line in enumerate(lines):
            if not isinstance(line, dict) or not isinstance(line.get("speaker"), str) or not isinstance(line.get("text"), str):
                raise EventDataError(f"{event_id}.actions[{index}].lines[{line_index}] requiere speaker y text")
            result.append(DialogueLine(line["speaker"], line["text"], line.get("portrait")))
        return tuple(result)

    @staticmethod
    def _text(action: dict[str, Any], key: str, event_id: str, index: int) -> str:
        value = action.get(key)
        if not isinstance(value, str) or not value.strip():
            raise EventDataError(f"{event_id}.actions[{index}].{key} debe ser texto no vacío")
        return value


def event_from_json(payload: dict[str, Any]) -> EventDefinition:
    if not isinstance(payload, dict):
        raise EventDataError("El evento debe ser un objeto")
    event_id = payload.get("id")
    trigger = payload.get("trigger", "interact")
    actions = payload.get("actions")
    if not isinstance(event_id, str) or not event_id:
        raise EventDataError("El evento requiere un id")
    if not isinstance(trigger, str):
        raise EventDataError(f"{event_id}: trigger debe ser texto")
    if not isinstance(actions, list):
        raise EventDataError(f"{event_id}: actions debe ser una lista")
    return EventDefinition(event_id, trigger, tuple(actions), bool(payload.get("once", False)), payload.get("condition_flag"))
