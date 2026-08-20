# Sistema JSON de mapas y eventos

El juego ya cuenta con una primera capa de datos separada de la lógica Pygame. `MapLoader` carga archivos desde `python_game/data/maps/` y devuelve objetos tipados `GameMap`, `TileLayer`, `MapEntity`, `RectData` y `Transfer`. Valida ids, dimensiones, capas, colisiones, entidades y destinos antes de que una escena use los datos.

`EventLoader` lee archivos agrupados por acto desde `python_game/data/events/`. `EventSystem` interpreta acciones declarativas y mantiene un `GameState` con flags, runas leídas, mapa actual, posición y orientación.

## Acciones disponibles

| Acción | Efecto |
|---|---|
| `dialogue` | Agrega líneas con `speaker`, `text` y retrato opcional |
| `set_flag` | Activa una bandera narrativa |
| `clear_flag` | Desactiva una bandera |
| `read_rune` | Registra una runa y produce un mensaje |
| `message` | Produce un mensaje breve para la escena |
| `transfer` | Cambia mapa y reposiciona al jugador mediante un `Transfer` |
| `complete` | Marca la secuencia como completada |

## Ejemplo de uso

```python
from pathlib import Path
from engine import EventLoader, EventSystem, GameState, MapLoader

root = Path(__file__).parent
maps = MapLoader(root / "data" / "maps")
horgr = maps.load("horgr")
transfers = {item.transfer_id: item for item in horgr.transfers}
state = GameState(current_map="horgr")
events = EventLoader(root / "data" / "events").load_file("act_01.json")
system = EventSystem(state, transfers.get)
result = system.run(events["read_isa"])
print(result.dialogue, state.runes_read)
```

El motor de escena será responsable de convertir `RectData` en `pygame.Rect`, dibujar las capas y presentar `EventResult.dialogue` en una caja de diálogo. El sistema JSON no conoce la interfaz ni el render, lo que permite probarlo en headless y cambiar la presentación sin modificar el canon narrativo.

## Prueba

Desde `python_game/`:

```bash
python3 test_json_system.py
```

La prueba carga el hörgr y la costa, ejecuta los tres eventos de lectura y confirma que `ISA`, `NAUTHIZ`, `PERTHRO` y `three_runes_read` quedan registrados.
