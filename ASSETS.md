# Assets

**Art direction:** Brutalismo editorial nórdico de sala de guerra: carbón, azul glacial, marfil, madera ennegrecida y ámbar de antorcha. Siluetas sólidas, materiales táctiles, iluminación de alto contraste y señales rúnicas funcionales.

## Backgrounds

| Name | Description | Size | Image |
|---|---|---|---|
| `visual_target` | Referencia de gameplay con tres corredores, monolitos y altar neutral | 1920x1080, composición de referencia | `/manus-storage/runa-fiordos-visual-target_fd05b397.png` |
| `menu_fjord` | Fiordo helado con monolito a la derecha y espacio negativo izquierdo | 1920x1080, fullscreen | `/manus-storage/runa-fiordos-menu_1172db7a.png` |

## Characters and Marks

| Name | Description | Size | Image |
|---|---|---|---|
| `eira` | Eira, jefa de clan con escudo y hacha | 160x220 px en HUD / 2.2m equivalente en escena | `/manus-storage/runa-fiordos-eira_a27bbd64.png` |
| `jotun` | Guardián neutral de basalto, hielo y relámpago ámbar | 190x240 px en escena | `/manus-storage/runa-fiordos-jotun_1b560cda.png` |
| `rune_mark` | Sello circular de tres cortes, sin texto | 56x56 px HUD / 32x32 px favicon | `/manus-storage/runa-fiordos-rune_0ec48bd2.png` |

## Procedural Runtime Assets

| Name | Description | Size | Implementation |
|---|---|---|---|
| `fjord_floor` | Placas de hielo y agua oscura | 2m tile visual | Meshes planas y materiales glacial/charcoal |
| `rune_posts` | Postes rúnicos de cada corredor | 1.5m alto | Extrusiones de piedra y madera |
| `monoliths` | Fortalezas finales de cada facción | 4m alto | Composición de cajas, cilindros y runas emisivas |
| `units` | Escuderos y arqueros | 0.8–1.1m alto | Meshes compactas por facción con escudo/capa |
| `effects` | Impactos, aura del Jotun y proyectiles | 0.2–2m | Anillos, sprites y materiales translúcidos |

## Primera familia de personajes — 2026-08-27

| Personaje | Asset persistente | Uso inicial |
|---|---|---|
| Ingrid | `/manus-storage/runa-personaje-ingrid-v1_22d45a0f.png` | Retrato jugable y roster del HUD |
| Astrid | `/manus-storage/runa-personaje-astrid-v1_c5a672bd.png` | Roster narrativo del HUD |
| Björn | `/manus-storage/runa-personaje-bjorn-v1_11bcb010.png` | Roster narrativo del HUD |
| Hakon | `/manus-storage/runa-personaje-hakon-v1_3642bca1.png` | Roster narrativo del HUD |
| Agnar | `/manus-storage/runa-personaje-agnar-v1_3c38f2b8.png` | Roster de legado y escenas de memoria |

La primera integración usa los retratos en placas recortadas del HUD. La siguiente etapa debe convertirlos en figuras de arena o sprites con silueta propia, sin asumir que un retrato frontal funciona automáticamente como unidad jugable.
