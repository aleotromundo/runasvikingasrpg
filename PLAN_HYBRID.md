# Plan de reconstrucción híbrida

## Decisión

La implementación activa seguirá en `/home/ubuntu/runa-de-los-fiordos`, que es el proyecto web administrado por Manus. La fuente conceptual y de contenido es la última versión útil de `aleotromundo/runasvikingasrpg`; su rama remota vacía no se modifica ni se usa como destino de despliegue. `unaleotromundo/elhilodelasnornas` tampoco se modifica y solo sirve para estudiar la presentación publicada.

## Vertical slice

La primera entrega será una defensa ritual de Bjørndal en dos estados conectados dentro de una sola experiencia: la costa de desembarco y el hörgr. Ingrid empieza frente a la señal de Agnar; puede desplazarse, leer Isa/Nauthiz/Perthro, combatir una pequeña presión de saqueadores y decidir qué apoyo del clan convoca. La decisión altera el siguiente beat y lleva al objetivo de encender la bengala o sostener la sala ritual.

## Capas

**React** será el marco, el HUD y los estados narrativos. **Babylon.js** será el lienzo, la cámara, las mallas, la iluminación, los efectos y la interacción espacial. **Datos** conservarán la gramática del repo base: habilidades, eventos, mapas, banderas y encuentros estarán modelados en TypeScript con forma equivalente a los JSON originales para poder crecer hacia contenido externo más adelante.

## Riesgos y mitigaciones

| Riesgo | Resolución |
|---|---|
| Pygame/Pygbag no es un runtime web estable para el proyecto actual | Portar conceptos y datos, no el renderer; Babylon será la implementación web directa |
| Geometría abstracta ilegible en cámara alta | Siluetas modulares con arma, capa, escudo, sombra y color de estado |
| Escenario bonito que oculta el combate | Cámara 3/4 fija, depth budget, edificios fuera del corredor central y foco de Ingrid |
| Combate sin aprendizaje | Introducción por capas: movimiento, amenaza, lectura rúnica, apoyo y consecuencia |
| HUD que compite con el juego | Bordes periféricos, centro despejado, panel contextual que aparece solo cuando cambia el estado |
| Demo no reproducible | `?demo` con estado determinista, reloj controlado y secuencia de eventos fija |

## Orden de construcción

1. Portar el vocabulario narrativo y el modelo de habilidades de runasvikingasrpg.
2. Construir escena 3D jugable con camino, costa, hörgr, Ingrid, amenaza y colisiones.
3. Añadir acciones rúnicas con telegráficos, impactos, cooldowns, recursos y respuestas narrativas.
4. Añadir HUD de sala de guerra, objetivo, apoyos y modal de consecuencia.
5. Añadir arte generado optimizado, responsive y modo demo.
6. Ejecutar typecheck, build y verificación visual desktop/móvil antes del checkpoint.
