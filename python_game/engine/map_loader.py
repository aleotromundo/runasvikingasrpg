"""Carga y valida mapas declarativos para Runas Vikingas RPG.

El módulo no depende de Pygame para poder probar los datos en headless.
Las coordenadas y rectángulos se expresan en píxeles.
"""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


class MapDataError(ValueError):
    """Error de esquema o contenido inválido en un mapa JSON."""


@dataclass(frozen=True)
class RectData:
    x: int
    y: int
    width: int
    height: int

    @classmethod
    def from_json(cls, value: Any, context: str) -> "RectData":
        if not isinstance(value, dict):
            raise MapDataError(f"{context}: se esperaba un objeto rectángulo")
        required = ("x", "y", "width", "height")
        if any(key not in value for key in required):
            raise MapDataError(f"{context}: faltan claves; se requieren {required}")
        numbers = tuple(value[key] for key in required)
        if any(not isinstance(number, int) for number in numbers):
            raise MapDataError(f"{context}: las coordenadas deben ser enteros")
        if value["width"] <= 0 or value["height"] <= 0:
            raise MapDataError(f"{context}: width y height deben ser positivos")
        return cls(*numbers)


@dataclass(frozen=True)
class TileLayer:
    name: str
    z_index: int
    tiles: tuple[tuple[int, ...], ...]
    visible: bool = True


@dataclass(frozen=True)
class MapEntity:
    entity_id: str
    kind: str
    x: int
    y: int
    properties: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class Transfer:
    transfer_id: str
    trigger: RectData
    target_map: str
    target_x: int
    target_y: int
    facing: str = "down"
    condition_flag: str | None = None


@dataclass(frozen=True)
class GameMap:
    map_id: str
    title: str
    width: int
    height: int
    tile_size: int
    layers: tuple[TileLayer, ...]
    collision_rects: tuple[RectData, ...]
    entities: tuple[MapEntity, ...]
    transfers: tuple[Transfer, ...]
    music: str | None = None
    region: str = "unknown"


class MapLoader:
    """Carga mapas JSON desde una carpeta raíz estable y valida su contrato."""

    def __init__(self, maps_dir: str | Path):
        self.maps_dir = Path(maps_dir)
        self._cache: dict[str, GameMap] = {}

    def load(self, map_id: str) -> GameMap:
        if map_id in self._cache:
            return self._cache[map_id]
        path = self.maps_dir / f"{map_id}.json"
        if not path.is_file():
            raise MapDataError(f"No existe el mapa '{map_id}': {path}")
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            raise MapDataError(f"JSON inválido en {path}: {exc}") from exc
        result = self._parse_map(payload, path)
        self._cache[map_id] = result
        return result

    def clear_cache(self) -> None:
        self._cache.clear()

    def _parse_map(self, payload: Any, path: Path) -> GameMap:
        context = str(path)
        if not isinstance(payload, dict):
            raise MapDataError(f"{context}: la raíz debe ser un objeto")
        required = ("id", "title", "width", "height", "tile_size", "layers", "collisions", "entities", "transfers")
        missing = [key for key in required if key not in payload]
        if missing:
            raise MapDataError(f"{context}: faltan claves obligatorias: {missing}")
        if payload["id"] != path.stem:
            raise MapDataError(f"{context}: id debe coincidir con el nombre del archivo")
        for key in ("width", "height", "tile_size"):
            if not isinstance(payload[key], int) or payload[key] <= 0:
                raise MapDataError(f"{context}: {key} debe ser un entero positivo")
        layers = tuple(self._parse_layer(item, index, context) for index, item in enumerate(payload["layers"]))
        collisions = tuple(RectData.from_json(item, f"{context}.collisions[{index}]") for index, item in enumerate(payload["collisions"]))
        entities = tuple(self._parse_entity(item, index, context) for index, item in enumerate(payload["entities"]))
        transfers = tuple(self._parse_transfer(item, index, context) for index, item in enumerate(payload["transfers"]))
        return GameMap(
            map_id=payload["id"],
            title=payload["title"],
            width=payload["width"],
            height=payload["height"],
            tile_size=payload["tile_size"],
            layers=layers,
            collision_rects=collisions,
            entities=entities,
            transfers=transfers,
            music=payload.get("music"),
            region=payload.get("region", "unknown"),
        )

    def _parse_layer(self, value: Any, index: int, context: str) -> TileLayer:
        prefix = f"{context}.layers[{index}]"
        if not isinstance(value, dict) or not isinstance(value.get("name"), str):
            raise MapDataError(f"{prefix}: se requiere name")
        tiles = value.get("tiles", [])
        if not isinstance(tiles, list) or any(not isinstance(row, list) or any(not isinstance(cell, int) for cell in row) for row in tiles):
            raise MapDataError(f"{prefix}.tiles: debe ser una matriz de enteros")
        return TileLayer(value["name"], int(value.get("z_index", index)), tuple(tuple(row) for row in tiles), bool(value.get("visible", True)))

    def _parse_entity(self, value: Any, index: int, context: str) -> MapEntity:
        prefix = f"{context}.entities[{index}]"
        if not isinstance(value, dict):
            raise MapDataError(f"{prefix}: se esperaba un objeto")
        required = ("id", "kind", "x", "y")
        if any(key not in value for key in required):
            raise MapDataError(f"{prefix}: faltan claves {required}")
        if not isinstance(value["id"], str) or not isinstance(value["kind"], str):
            raise MapDataError(f"{prefix}: id y kind deben ser texto")
        if not all(isinstance(value[key], int) for key in ("x", "y")):
            raise MapDataError(f"{prefix}: x e y deben ser enteros")
        properties = value.get("properties", {})
        if not isinstance(properties, dict):
            raise MapDataError(f"{prefix}.properties: debe ser un objeto")
        return MapEntity(value["id"], value["kind"], value["x"], value["y"], properties)

    def _parse_transfer(self, value: Any, index: int, context: str) -> Transfer:
        prefix = f"{context}.transfers[{index}]"
        if not isinstance(value, dict):
            raise MapDataError(f"{prefix}: se esperaba un objeto")
        required = ("id", "trigger", "target_map", "target_x", "target_y")
        if any(key not in value for key in required):
            raise MapDataError(f"{prefix}: faltan claves {required}")
        if not isinstance(value["id"], str) or not isinstance(value["target_map"], str):
            raise MapDataError(f"{prefix}: id y target_map deben ser texto")
        if not all(isinstance(value[key], int) for key in ("target_x", "target_y")):
            raise MapDataError(f"{prefix}: target_x y target_y deben ser enteros")
        return Transfer(value["id"], RectData.from_json(value["trigger"], f"{prefix}.trigger"), value["target_map"], value["target_x"], value["target_y"], value.get("facing", "down"), value.get("condition_flag"))
