# Runas Vikingas RPG

Este repositorio contiene el desarrollo real de la adaptación de *El Hilo de las Nornas* a un RPG narrativo en Python y `pygame-ce`.

## Estado actual

La carpeta `python_game/` contiene el primer prototipo ejecutable real. No es una interfaz web ni una simulación visual: abre una ventana de juego, procesa el loop de Pygame, controla a Ingrid, aplica delta time, resuelve colisiones, permite leer Isa/Nauthiz/Perthro y lleva la acción a una primera amenaza costera.

La apertura presenta la muerte de Agnar, la tensión entre Björn y Hakon y el presagio de la costa. En la escena ritual, el jugador debe acercarse a las tres piedras y pulsar Espacio o Enter para leerlas. Al completar la lectura, aparece la costa y el objetivo es llegar a la bengala sin perder el vigor.

## Ejecutar

```bash
cd python_game
python3 -m pip install -r requirements.txt
python3 main.py
```

## Estructura

| Ruta | Función |
|---|---|
| `python_game/main.py` | Juego ejecutable y loop asíncrono compatible con Pygbag |
| `python_game/requirements.txt` | Dependencias mínimas |
| `python_game/README.md` | Controles y exportación |
| `docs/base_tecnica_python_pygame.md` | Decisiones basadas en documentación oficial |
| `docs/README_prototipo_python.md` | Explicación del vertical slice |
| `docs/GUIA_PYGBAG.md` | Compilación y publicación web con Pygbag |
| `docs/SISTEMA_JSON.md` | MapLoader, EventSystem y esquema de datos |

La carpeta `client/` del proyecto de prueba web anterior no define el juego real; queda como referencia visual descartable para la dirección artística.
