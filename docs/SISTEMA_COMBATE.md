# Sistema de combate por turnos

El prototipo ya tiene un sistema de combate por turnos inspirado en la legibilidad de los RPG clásicos, pero con reglas propias de Runas Vikingas. El núcleo está en `python_game/engine/combat_system.py` y carga sus datos desde `python_game/data/combat/`.

## Modelo de datos

| Archivo | Contenido |
|---|---|
| `abilities.json` | Nombre, poder, coste de vigor rúnico, tipo, objetivo y estado |
| `encounters/coast_shadow.json` | Actores, equipos, vida, ataque, defensa, velocidad y habilidades |
| `combat_system.py` | Iniciativa, acciones, daño, defensa, estados y condiciones de final |

Cada `Combatant` pertenece al equipo `heroes` o `enemies` y tiene vida, ataque, defensa, velocidad, mana y habilidades. La cola de turnos ordena por velocidad y usa el id como desempate determinista, lo que hace reproducible el balanceo y las pruebas.

## Acciones

`attack` aplica el ataque base contra un enemigo. `defend` activa una guardia que duplica la defensa contra el siguiente golpe y se consume al recibir daño. `ability:<id>` busca una habilidad declarada en JSON, comprueba el coste de vigor rúnico, aplica daño o curación y puede registrar un estado como `slowed` o `bound`.

La fórmula actual es deliberadamente transparente:

```text
daño = max(1, poder_del_actor + poder_de_habilidad - defensa_del_objetivo)
```

Mientras el objetivo está defendiendo, su defensa se duplica para ese golpe. Los estados tienen una duración en turnos y están preparados para modificar velocidad, acciones o daño en una siguiente iteración.

## Habilidades rúnicas

`Isa: Hielo quieto` causa daño y aplica `slowed`. `Nauthiz: Presión` causa daño y aplica `bound`. `Perthro: Dado oculto` representa una acción de alto coste y daño. `Aliento de brasa` recupera vida de un aliado. Estas habilidades son datos, no condicionales dispersos en el código, de modo que se pueden balancear desde JSON.

## Uso mínimo

```python
from pathlib import Path
from engine.combat_system import CombatSystem

combat = CombatSystem(Path("data/combat"))
combat.start("coast_shadow")
result = combat.execute("ability:isa_guard", target_id="coast_shadow")
print(result.message)
```

## Prueba actual

Desde `python_game/`:

```bash
python3 test_combat_system.py
```

La prueba verifica el orden inicial, el uso de Isa, la aplicación de `slowed`, la defensa, la resolución de daño y la victoria de Ingrid. El encuentro termina en el tercer round con una acción de Perthro.

La integración visual con una interfaz de selección de comandos queda como siguiente capa: la escena debe mostrar `available_actions()`, pedir un objetivo válido y renderizar `ActionResult.message`, sin duplicar las reglas en Pygame.
