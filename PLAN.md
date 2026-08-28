# Game Plan: Runa de los Fiordos

## Risk Tasks

### 1. Arena táctica con tres corredores
- **Why isolated:** La escena debe mostrar rutas, jungla, estructuras y un objetivo central sin que el jugador pierda orientación.
- **Approach:** Usar una cámara ortográfica cenital inclinada, una arena simétrica de lectura inmediata y geometría procedural con materiales diferenciados; reservar el centro para el Jotun y dejar corredores despejados para las oleadas.
- **Verify:** En una captura el jugador puede identificar ambos monolitos, los tres corredores, los postes rúnicos y el altar neutral sin explicación adicional.

### 2. Actores con silueta y respuesta visual
- **Why isolated:** Eira, las tropas y el Jotun deben sentirse como personajes sólidos aunque el movimiento sea sencillo.
- **Approach:** Combinar meshes de bajo número de piezas pero con proporciones marcadas, colores por facción, placas de armadura, escudos, capas y escalas distintas. Reservar efectos de impacto para cambios de escala/opacidad breves y legibles.
- **Verify:** Eira se distingue de soldados y Jotun a primera vista; los estados idle, movimiento y ataque no producen clipping evidente ni desaparecen durante una transición.

### 3. Bucle de combate y asedio
- **Why isolated:** Movimiento, habilidades, oleadas, daño, experiencia, gloria y victoria deben coordinarse sin depender de React.
- **Approach:** Un `GameWorld` posee actores y estado; `Player`, `WaveManager`, `ObjectiveManager` y `Structure` actualizan mediante un único tick. El modo `?demo` activa decisiones deterministas para una prueba reproducible.
- **Verify:** Las teclas WASD mueven a Eira, las teclas 1/2/3 lanzan habilidades con cooldown, las oleadas golpean estructuras, el Jotun reaparece y una estructura destruida cambia el avance.

## Main Build

Se construirá una experiencia web de una sola pantalla con una breve pantalla de entrada y una arena jugable. El núcleo será un duelo 1v1 contra IA: Eira protege el monolito azul y presiona el monolito rojo a través de tres corredores. El escenario tendrá hielo, agua oscura, madera ennegrecida, runas, pinos, bruma suave y un altar central. La interfaz utilizará paneles angulares en carbón, marfil y ámbar.

- **Assets needed:** fondo de menú panorámico, referencia visual de arena, retrato/cutout de Eira, retrato/cutout del Jotun y sello de runa de marca. La geometría de suelo, muros, postes, unidades simples y partículas se generará proceduralmente con materiales propios.
- **Verify:**
  - El movimiento responde inmediatamente y el jugador queda dentro de la arena.
  - Las habilidades tienen feedback visual y cooldown visible.
  - La vida, gloria, nivel, estado del Jotun y estructuras son legibles sin solaparse.
  - No hay texturas rotas, imágenes de fallback ni placeholders visibles en el primer plano.
  - El flujo permite entrar, jugar, ganar/perder y reiniciar.
  - El modo `?demo` produce una escena viva y reproducible para captura.
  - No hay errores en consola durante la ejecución.
  - La paleta, materiales, escala y composición respetan la dirección Sala de Guerra Ámbar.
  - La captura final funciona en desktop y en una anchura menor.
