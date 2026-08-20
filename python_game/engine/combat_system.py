"""Sistema de combate por turnos alimentado por JSON.

La resolución es determinista por defecto para facilitar pruebas y balanceo.
"""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


class CombatDataError(ValueError):
    """Datos de combate ausentes o inválidos."""


@dataclass(frozen=True)
class Ability:
    ability_id: str
    name: str
    power: int
    cost: int = 0
    kind: str = "attack"
    target: str = "enemy"
    status: str | None = None
    status_chance: int = 0
    description: str = ""


@dataclass
class Combatant:
    combatant_id: str
    name: str
    team: str
    max_hp: int
    hp: int
    attack: int
    defense: int
    speed: int
    max_mana: int = 0
    mana: int = 0
    ability_ids: tuple[str, ...] = ()
    statuses: dict[str, int] = field(default_factory=dict)
    defending: bool = False

    @property
    def alive(self) -> bool:
        return self.hp > 0

    def has_status(self, status: str) -> bool:
        return self.statuses.get(status, 0) > 0


@dataclass(frozen=True)
class ActionResult:
    actor_id: str
    action: str
    target_id: str | None
    amount: int = 0
    message: str = ""
    battle_over: bool = False
    winner: str | None = None


class CombatSystem:
    def __init__(self, data_dir: str | Path):
        self.data_dir = Path(data_dir)
        self.abilities: dict[str, Ability] = {}
        self.combatants: dict[str, Combatant] = {}
        self.turn_order: list[str] = []
        self.turn_index = 0
        self.round = 0
        self.phase = "idle"
        self.log: list[str] = []
        self._load_abilities()

    def _load_abilities(self) -> None:
        payload = self._read_json("abilities.json")
        raw = payload.get("abilities")
        if not isinstance(raw, list):
            raise CombatDataError("abilities.json requiere una lista abilities")
        for item in raw:
            ability = self._parse_ability(item)
            if ability.ability_id in self.abilities:
                raise CombatDataError(f"Habilidad repetida: {ability.ability_id}")
            self.abilities[ability.ability_id] = ability

    def start(self, encounter_id: str) -> None:
        payload = self._read_json(f"encounters/{encounter_id}.json")
        raw = payload.get("combatants")
        if not isinstance(raw, list) or not raw:
            raise CombatDataError(f"El encuentro {encounter_id} requiere combatants")
        self.combatants = {}
        for item in raw:
            combatant = self._parse_combatant(item)
            if combatant.combatant_id in self.combatants:
                raise CombatDataError(f"Combatiente repetido: {combatant.combatant_id}")
            self.combatants[combatant.combatant_id] = combatant
        self.turn_order = sorted(self.combatants, key=lambda item: (-self.combatants[item].speed, item))
        self.turn_index = 0
        self.round = 1
        self.phase = "active"
        self.log = [f"Comienza el combate: {payload.get('title', encounter_id)}."]
        self._skip_dead_and_expire_statuses()

    @property
    def active_actor(self) -> Combatant | None:
        if self.phase != "active" or not self.turn_order:
            return None
        return self.combatants[self.turn_order[self.turn_index]]

    def available_actions(self, actor_id: str | None = None) -> tuple[str, ...]:
        actor = self._actor(actor_id)
        if actor is None or not actor.alive:
            return ()
        actions = ["attack", "defend"]
        actions.extend(f"ability:{ability_id}" for ability_id in actor.ability_ids if self.abilities[ability_id].cost <= actor.mana)
        return tuple(actions)

    def execute(self, action: str, target_id: str | None = None, actor_id: str | None = None) -> ActionResult:
        actor = self._actor(actor_id)
        if actor is None or self.phase != "active":
            raise CombatDataError("No hay un actor activo")
        if actor_id is not None and actor_id != self.active_actor.combatant_id:
            raise CombatDataError("No es el turno de ese actor")
        if not actor.alive:
            raise CombatDataError("El actor está derrotado")
        if action == "attack":
            target = self._target(target_id, "enemy", actor.team)
            result = self._damage(actor, target, actor.attack, "ataque")
        elif action == "defend":
            actor.defending = True
            result = ActionResult(actor.combatant_id, "defend", None, message=f"{actor.name} adopta una guardia cerrada.")
        elif action.startswith("ability:"):
            ability_id = action.split(":", 1)[1]
            ability = self.abilities.get(ability_id)
            if ability is None or ability_id not in actor.ability_ids:
                raise CombatDataError(f"Habilidad no disponible: {ability_id}")
            if actor.mana < ability.cost:
                raise CombatDataError(f"{actor.name} no tiene suficiente vigor rúnico")
            actor.mana -= ability.cost
            target = self._target(target_id, ability.target, actor.team) if ability.kind != "buff" else actor
            result = self._resolve_ability(actor, target, ability)
        else:
            raise CombatDataError(f"Acción desconocida: {action}")
        self.log.append(result.message)
        if result.battle_over:
            self.phase = "won" if result.winner == "heroes" else "lost"
        else:
            self._advance_turn()
        return result

    def _resolve_ability(self, actor: Combatant, target: Combatant, ability: Ability) -> ActionResult:
        if ability.kind == "heal":
            amount = min(ability.power, target.max_hp - target.hp)
            target.hp += amount
            return ActionResult(actor.combatant_id, ability.ability_id, target.combatant_id, amount, f"{actor.name} usa {ability.name}: {target.name} recupera {amount} de vigor.")
        result = self._damage(actor, target, actor.attack + ability.power, ability.name)
        if ability.status and target.alive and ability.status_chance >= 100:
            target.statuses[ability.status] = 2
            return ActionResult(result.actor_id, result.action, result.target_id, result.amount, result.message + f" {target.name} queda afectado por {ability.status}.", result.battle_over, result.winner)
        return result

    def _damage(self, actor: Combatant, target: Combatant, raw_power: int, label: str) -> ActionResult:
        mitigation = target.defense * (2 if target.defending else 1)
        amount = max(1, raw_power - mitigation)
        target.defending = False
        target.hp = max(0, target.hp - amount)
        message = f"{actor.name} ejecuta {label} contra {target.name}: {amount} de daño."
        winner = self._winner()
        return ActionResult(actor.combatant_id, label, target.combatant_id, amount, message, winner is not None, winner)

    def _advance_turn(self) -> None:
        self._skip_dead_and_expire_statuses()
        if self._winner() is not None:
            self.phase = "won" if self._winner() == "heroes" else "lost"
            return
        for _ in range(len(self.turn_order)):
            self.turn_index = (self.turn_index + 1) % len(self.turn_order)
            if self.combatants[self.turn_order[self.turn_index]].alive:
                if self.turn_index == 0:
                    self.round += 1
                return

    def _skip_dead_and_expire_statuses(self) -> None:
        for combatant in self.combatants.values():
            combatant.statuses = {name: turns - 1 for name, turns in combatant.statuses.items() if turns > 1}

    def _winner(self) -> str | None:
        teams = {team: any(item.alive and item.team == team for item in self.combatants.values()) for team in {item.team for item in self.combatants.values()}}
        if teams.get("heroes") and not teams.get("enemies"):
            return "heroes"
        if teams.get("enemies") and not teams.get("heroes"):
            return "enemies"
        return None

    def _actor(self, actor_id: str | None) -> Combatant | None:
        if actor_id is None:
            return self.active_actor
        return self.combatants.get(actor_id)

    def _target(self, target_id: str | None, target_kind: str, actor_team: str) -> Combatant:
        if target_id is None or target_id not in self.combatants:
            raise CombatDataError("La acción requiere un target_id válido")
        target = self.combatants[target_id]
        expected_team = actor_team if target_kind == "ally" else ("enemies" if actor_team == "heroes" else "heroes")
        if target_kind == "self" and target.team != actor_team:
            raise CombatDataError("Objetivo propio inválido")
        if target_kind == "enemy" and target.team == actor_team:
            raise CombatDataError("El objetivo debe pertenecer al bando enemigo")
        if target_kind == "ally" and target.team != actor_team:
            raise CombatDataError("El objetivo debe pertenecer al bando aliado")
        if not target.alive:
            raise CombatDataError("El objetivo está derrotado")
        return target

    def _read_json(self, filename: str) -> dict[str, Any]:
        path = self.data_dir / filename
        if not path.is_file():
            raise CombatDataError(f"No existe el archivo de combate: {path}")
        try:
            value = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            raise CombatDataError(f"JSON inválido en {path}: {exc}") from exc
        if not isinstance(value, dict):
            raise CombatDataError(f"La raíz de {path} debe ser un objeto")
        return value

    @staticmethod
    def _parse_ability(value: Any) -> Ability:
        required = ("id", "name", "power")
        if not isinstance(value, dict) or any(key not in value for key in required):
            raise CombatDataError(f"Habilidad inválida: requiere {required}")
        return Ability(value["id"], value["name"], int(value["power"]), int(value.get("cost", 0)), value.get("kind", "attack"), value.get("target", "enemy"), value.get("status"), int(value.get("status_chance", 0)), value.get("description", ""))

    @staticmethod
    def _parse_combatant(value: Any) -> Combatant:
        required = ("id", "name", "team", "max_hp", "attack", "defense", "speed")
        if not isinstance(value, dict) or any(key not in value for key in required):
            raise CombatDataError(f"Combatiente inválido: requiere {required}")
        max_hp = int(value["max_hp"])
        max_mana = int(value.get("max_mana", 0))
        return Combatant(value["id"], value["name"], value["team"], max_hp, int(value.get("hp", max_hp)), int(value["attack"]), int(value["defense"]), int(value["speed"]), max_mana, int(value.get("mana", max_mana)), tuple(value.get("abilities", [])))
