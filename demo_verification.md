# Verificación de demostración Pygbag

La salida se generó con `pygbag .` desde `python_game/` y se sirvió como archivos estáticos desde `build/web/`.

La primera exposición falló porque el servidor de Pygbag estaba ligado a `127.0.0.1`. Al servir la misma carpeta con `python3 -m http.server 8000 --bind 0.0.0.0 --directory build/web`, la URL pública cargó correctamente.

El navegador mostró el canvas Pygame, el título `El Hilo de las Nornas — Prototipo real` y la primera pantalla del prólogo: `Cuando murió Agnar`, con el texto sobre Björn, Hakon y el avance con Espacio/Enter.

Conclusión: Pygbag sí produjo una salida web funcional para este prototipo. El problema anterior no era el juego ni el build final, sino el servidor de prueba ligado a localhost y la plantilla `basic` que devolvía 404.
