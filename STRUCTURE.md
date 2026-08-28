# Estructura de Runa de los Fiordos

## Regla de ownership
React funciona como marco de presentación. Babylon posee la escena, cámara, materiales y nodos. La lógica de juego vive en clases TypeScript bajo `client/src/game/` y no conoce componentes React.

## Módulos

| Módulo | Responsabilidad |
|---|---|
| `scene.ts` | Crear engine scene, cámara ortográfica, luces, materiales, arena, actores y devolver `GameHandle`. |
| `GameWorld.ts` | Estado de partida, tick único, fases `menu`, `playing`, `victory`, `defeat`, score y eventos HUD. |
| `actors.ts` | Clases `Player`, `Unit`, `Structure` y `Jotun` con meshes propios, vida, facción y comportamiento. |
| `systems.ts` | Oleadas, búsqueda del corredor más cercano, habilidades, daño, gloria, cooldowns y objetivo neutral. |
| `input.ts` | Acciones semánticas para WASD, teclas 1/2/3, click/tap y reinicio. |
| `hud.ts` | Capa DOM separada para encabezado, estado del clan, registro, habilidades, minimapa y overlays de victoria/derrota. |

## Entidades principales

`Player` representa a Eira y posee movimiento, ataque cercano, proyectil de hacha y tormenta circular. `Unit` representa escuderos y arqueros de cada facción; avanza por un corredor y ataca estructuras o unidades cercanas. `Structure` representa postes rúnicos y monolitos con vida y estado destruido. `Jotun` permanece en el altar central, se activa por temporizador y concede bendición de asedio al clan que lo derrota.

## Asset Hints

- Fondo de menú panorámico: `/manus-storage/runa-fiordos-menu_1172db7a.png`.
- Referencia visual de arena: `/manus-storage/runa-fiordos-visual-target_fd05b397.png`.
- Eira: `/manus-storage/runa-fiordos-eira_a27bbd64.png`.
- Jotun: `/manus-storage/runa-fiordos-jotun_1b560cda.png`.
- Sello: `/manus-storage/runa-fiordos-rune_0ec48bd2.png`.
- El suelo y las estructuras menores deben usar geometría y materiales generados en runtime para conservar nitidez, profundidad y rendimiento.

## Camera and HUD Contract

La cámara es ortográfica y ligeramente inclinada, con escala fija adaptable al viewport. El HUD DOM ocupa bordes seguros y no intercepta las acciones del canvas salvo botones explícitos. El canvas ocupa el fondo completo y se libera con `dispose()`.
