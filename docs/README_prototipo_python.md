# El Hilo de las Nornas — prototipo real

Este directorio contiene el primer prototipo jugable real en Python y `pygame-ce`. No es una maqueta web: abre una ventana de juego, procesa eventos, usa delta time, mueve a Ingrid, bloquea colisiones, permite leer tres piedras rúnicas y transiciona a una costa con una amenaza que persigue, anuncia su golpe y puede derrotar al jugador.

## Ejecución local

```bash
python3 -m pip install -r requirements.txt
python3 main.py
```

La apertura funciona así: una breve introducción presenta la muerte de Agnar y la amenaza de la costa; luego Ingrid explora el hörgr, se acerca a Isa, Nauthiz y Perthro y pulsa espacio para leer cada piedra. Al completar la lectura, aparece la escena de la costa. El objetivo es llegar a la bengala sin perder los tres puntos de vigor.

## Controles

| Tecla | Acción |
|---|---|
| WASD o flechas | Mover a Ingrid |
| Espacio o Enter | Avanzar el prólogo / leer una runa |
| R | Reiniciar la costa después de un resultado |
| Escape | Salir |

## Exportación prevista

Pygbag requiere que el punto de entrada sea `main.py`, que el loop sea asíncrono y que incluya `await asyncio.sleep(0)`. Cuando el prototipo esté validado localmente, se puede probar:

```bash
python3 -m pip install pygbag
pygbag --template basic .
```

La versión React del entorno de prueba puede usarse como dirección visual, pero este directorio contiene la base del videojuego real.
