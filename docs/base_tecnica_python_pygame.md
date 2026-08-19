# Base técnica para el juego real

## Python

La documentación oficial de Python presenta módulos, clases, funciones, estructuras de datos, JSON, excepciones y paquetes como las piezas apropiadas para organizar programas que crecen. Para este proyecto se usará una separación explícita entre escenas, entidades, reglas de combate, datos narrativos y punto de entrada, en lugar de concentrar todo en una pantalla React.

Fuente: https://docs.python.org/3/tutorial/

## Pygame

La documentación oficial muestra un loop de juego con `pygame.init()`, una superficie de display, `pygame.time.Clock()`, lectura de eventos, render, `pygame.display.flip()` y limitación de frames. Para movimiento recomienda usar `dt = clock.tick(60) / 1000`, de modo que la velocidad sea independiente de la tasa de frames. Pygame ofrece `Surface`, `Rect`, `Sprite`, `Group`, `event`, `key`, `draw`, `image`, `font` y `time`, que son suficientes para una primera escena real con mapa, entidades y colisiones.

Fuente: https://www.pygame.org/docs/

## Pygbag

La documentación oficial de Pygbag exige que el archivo de entrada sea `main.py`, que el loop se encuentre dentro de `async def main()`, que se ejecute con `asyncio.run(main())` y que el loop incluya `await asyncio.sleep(0)` después de `clock.tick()` o en una posición equivalente. También orienta la compatibilidad hacia pygame-ce y requiere que los assets estén dentro del proyecto para poder empaquetarlos.

Fuente: https://pygame-web.github.io/wiki/pygbag/

## Decisión arquitectónica

La nueva versión será un juego real en Python/Pygame, no una interfaz web que simula un mapa. La primera escena será un vertical slice narrativo: la ceremonia por Agnar, la lectura de Isa/Nauthiz/Perthro, control directo de Ingrid en un espacio explorable y el primer presagio de la amenaza costera. El prototipo debe poder ejecutarse localmente con Python y pygame-ce; después se probará el empaquetado web con Pygbag.

La versión React existente se conserva únicamente como referencia visual temporal. No se debe presentar como el juego ni seguir ampliándola como sustituto del prototipo Python.
