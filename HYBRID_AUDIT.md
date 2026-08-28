# Auditoría de base y decisión híbrida

## Alcance

La base activa elegida es `aleotromundo/runasvikingasrpg`. Su rama `main` fue vaciada en el commit `196d722` por solicitud previa, por lo que la última versión útil se recuperó de su historial en `c0848eb`. Esa versión contiene un RPG en Python/Pygame con aproximadamente 1.819 líneas, mapas JSON, eventos narrativos, un sistema de combate por datos y una salida Pygbag incompleta. El repositorio de Vercel `unaleotromundo/elhilodelasnornas` queda fuera de la implementación y se conserva intacto como referencia visual publicada.

## Veredicto ejecutivo

`runasvikingasrpg` tiene la mejor **semilla narrativa y de diseño sistémico**: la muerte de Agnar, la incertidumbre de Ingrid, las tres runas, el traslado entre la costa y el hörgr, los datos de combate y la intención de separar contenido de motor. No tiene una base web moderna aprovechable en su estado actual porque el código principal es Pygame, la salida web depende de Pygbag y sus mapas contienen capas mínimas de demostración.

La referencia de Vercel tiene la mejor **identidad visual, presentación y bucle de acción inicial**: canvas Babylon a pantalla completa, portada editorial, escenario nocturno, HUD narrativo, cuatro habilidades, objetivo dinámico, cooldowns y respuesta visual de Isa. Sus debilidades observables son una cámara que deja que la geometría tape el centro, una lectura de unidades demasiado abstracta, poca profundidad de navegación y una derrota que puede aparecer antes de que el jugador entienda la causa.

La nueva versión debe ser una **reconstrucción web en React + Babylon.js**, no una conversión literal de Pygame ni una copia del bundle de Vercel. El código de `runasvikingasrpg` será la fuente de verdad para nombres, datos, relaciones, mapas conceptuales y eventos; la referencia de Vercel aportará lenguaje visual, composición, HUD y el bucle de combate; la implementación nueva resolverá legibilidad, siluetas, profundidad, onboarding y feedback.

## Comparación objetiva

| Área | runasvikingasrpg | Referencia Vercel | Decisión para la nueva base |
|---|---|---|---|
| Narrativa | Clara semilla de saga: Agnar, Ingrid, Isa, Nauthiz, Perthro y bengala | Excelente tono editorial y frases de combate | Conservar datos y tono; convertir cada evento en objetivo visible y jugable |
| Arquitectura | JSON para eventos, mapas y habilidades; separación engine/data | React, Babylon y HUD integrados, pero el juego está concentrado en una escena | Mantener separación data/engine y rehacer la presentación web con módulos de juego |
| Cámara | Pygame 2D; no resuelve la fantasía isométrica moderna | Isométrica 3D atractiva, pero el primer plano oculta demasiado | Cámara 3/4 más baja, zoom limitado, oclusión controlada y foco claro en Ingrid |
| Personajes | Entidades conceptuales, sin arte final | Ingrid visible en retrato, pero unidades de arena abstractas | Siluetas 3D modulares, sombras de contacto, emblemas y estados de animación |
| Combate | Abilities JSON y reglas testables; buen punto de balance | Feedback inmediato: círculo de Isa, cooldown, lectura narrativa | Conservar el modelo de habilidades y ampliar telegráficos, hit-stop, proyectiles y daño legible |
| Mundo | Coast y hörgr con colisiones, transfers y entidades | Bjørndal/Playa Negra muy evocadores, pero geometría simplificada | Dos espacios conectados: costa como presión y hörgr como lectura; landmarks funcionales |
| UI | Casi inexistente en web | HUD muy fuerte, editorial y responsive | Adoptar HUD contextual; reducir densidad y reservar el centro para el combate |
| Progresión | Banderas narrativas y encuentro de costa | Fragmentos, oleadas, apoyos y jefe sugeridos | Progresión corta en cuatro beats: leer, resistir, elegir apoyo, enfrentar consecuencia |
| Plataforma | Pygbag introduce fragilidad y poca integración con WebDev | Vite/Babylon ya demuestra el destino correcto | Implementar directamente en Babylon dentro del proyecto Manus |

## Lo que se conserva

Se conserva la premisa «cuando murió Agnar, el silencio ocupó su lugar», Ingrid como protagonista que interpreta en vez de obedecer, la tríada de runas Isa/Nauthiz/Perthro, la bengala como primer objetivo, la costa y el hörgr como espacios con funciones distintas, los datos JSON como vocabulario de contenido y el principio de que cada habilidad debe expresar una lectura rúnica.

También se conserva del despliegue la portada asimétrica, la paleta azul-negra/ámbar/rojo/hielo, la tipografía editorial para la saga, la barra de cuatro habilidades, la lectura reactiva de Ingrid, el objetivo visible y el concepto de que la interfaz sea una pieza física de la ficción.

## Lo que se descarta o se corrige

Se descarta la dependencia de Pygame/Pygbag como runtime web, los mapas de prueba con capas de pocos tiles, la representación abstracta sin silueta, la oclusión excesiva de edificios, los efectos que comunican color pero no origen o destino, y cualquier sistema que muestre un game over antes de que el jugador haya aprendido movimiento, amenaza y habilidad.

No se copiarán assets pesados del repositorio de Vercel a la nueva base. Se crearán o subirán assets web optimizados conforme al flujo de WebDev, manteniendo el repo original y el repo de Vercel sin modificaciones.

## Criterios de aceptación de la primera vertical slice

La primera escena debe mostrar en los primeros segundos quién es Ingrid, qué está amenazado, dónde están la costa y la ruta al hörgr, y qué hace cada runa. El jugador debe poder moverse, activar una habilidad, ver una reacción enemiga y comprender el siguiente objetivo sin leer un manual. La cámara debe mantener a Ingrid y al objetivo visibles; el HUD debe funcionar en escritorio y móvil; la derrota debe explicar la consecuencia; y el modo `?demo` debe reproducir el flujo de forma determinista para validar capturas.

## Fuentes internas

1. Historial de `aleotromundo/runasvikingasrpg`, commit `c0848eb`, recuperado localmente sin modificar la rama actual.
2. `RPG_DESIGN.md`, `NARRATIVE_SOURCE.md`, `STRUCTURE.md`, `ASSETS.md` y `ideas.md` del repositorio `unaleotromundo/elhilodelasnornas`.
3. Observación directa de `https://elhilodelasnornas.vercel.app/`: portada, inicio de arena, activación de Isa y estado de derrota.

## Fuentes externas de criterio

La investigación de diseño confirma que la legibilidad no equivale a eliminar profundidad: los telegráficos deben permitir reconocer el peligro y dejar que la decisión sobre varios peligros simultáneos produzca profundidad. El combate debe tratarse como un sistema de conflicto entre jugador y enemigos, y el entorno puede funcionar como portador de significado y guía espacial. Estos principios se aplicarán como requisitos de implementación, no como decoración.

- [Level Design Book — Combat](https://book.leveldesignbook.com/process/combat)
- [The Narrative Toolbox for Level Designers](https://www.corbengilbert.com/level-design-toolbox)
- [The Environment is the Story: Indexical Storytelling in Dark Souls](https://repozitorij.unizd.hr/object/unizd:10407)
