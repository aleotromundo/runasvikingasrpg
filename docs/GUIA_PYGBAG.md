# Compilar Runas Vikingas RPG para navegadores con Pygbag

Pygbag empaqueta un programa Python que usa `pygame-ce` para ejecutarlo en navegadores mediante WebAssembly. El resultado no es un servidor Python: es un conjunto de archivos estáticos que el navegador carga y ejecuta.

La documentación oficial de Pygbag exige un archivo de entrada llamado `main.py`, un loop dentro de `async def main()`, una llamada final a `asyncio.run(main())` y una cesión explícita del control mediante `await asyncio.sleep(0)` dentro del loop [1]. El prototipo de este repositorio ya cumple esos requisitos.

## 1. Preparar el entorno

Desde la raíz del repositorio:

```bash
git clone https://github.com/aleotromundo/runasvikingasrpg.git
cd runasvikingasrpg/python_game
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

El archivo `requirements.txt` contiene `pygame-ce` y `pygbag`. Si se trabaja sin entorno virtual, pueden instalarse con `python3 -m pip install pygame-ce pygbag`, aunque el entorno virtual evita mezclar dependencias con otros proyectos.

Antes de empaquetar, conviene comprobar la ejecución local:

```bash
python main.py
```

La ventana debe mostrar el prólogo. Se avanza con Espacio o Enter, se mueve a Ingrid con WASD o flechas y se leen las tres piedras rúnicas al acercarse a ellas. Al completar Isa, Nauthiz y Perthro aparece la costa.

## 2. Comprobar la estructura mínima

Pygbag debe recibir como último argumento la carpeta que contiene el `main.py` principal. En este proyecto:

```text
runasvikingasrpg/
├── python_game/
│   ├── main.py
│   ├── requirements.txt
│   └── README.md
└── docs/
    └── GUIA_PYGBAG.md
```

Por eso el comando debe ejecutarse dentro de `python_game/`, no desde la raíz si no se indica esa carpeta como argumento.

El loop de `main.py` tiene esta forma esencial:

```python
import asyncio
import pygame

async def main():
    while running:
        dt = clock.tick(60) / 1000.0
        process_events()
        update(dt)
        draw()
        pygame.display.flip()
        await asyncio.sleep(0)

if __name__ == "__main__":
    asyncio.run(main())
```

La llamada `await asyncio.sleep(0)` no es decorativa. Permite que el runtime del navegador recupere el control entre frames. Si se elimina, el juego puede bloquear la página o no comportarse correctamente en WebAssembly [1].

## 3. Empaquetar con Pygbag

El flujo básico documentado es:

```bash
cd runasvikingasrpg/python_game
source .venv/bin/activate
pygbag .
```

Pygbag crea los artefactos dentro de:

```text
python_game/build/web/
```

Según la versión instalada, el comando puede iniciar también un servidor de prueba local. Si el proceso queda ejecutándose, no hay que cerrarlo inmediatamente: se debe abrir la URL local que indique la consola, normalmente una dirección `localhost` con un puerto asignado.

Una variante habitual es:

```bash
pygbag --template basic .
```

Sin embargo, la plantilla puede depender de la versión de Pygbag y de su CDN. En este proyecto, esa variante llegó a empaquetar los archivos pero intentó descargar una plantilla `basic` desde `https://pygame-web.github.io/cdn/0.9.3/basic` y recibió HTTP 404. Por eso se recomienda probar primero `pygbag .`, actualizar Pygbag si es necesario y consultar la documentación de la versión instalada antes de fijar una plantilla.

## 4. Probar la salida web

Hay dos objetivos distintos:

| Prueba | Qué valida |
|---|---|
| Ejecución local con `python main.py` | Lógica del juego, controles, colisiones y narrativa |
| Ejecución empaquetada con Pygbag | Compatibilidad con WebAssembly, carga de assets y loop asíncrono |

No conviene diagnosticar errores de gameplay desde el empaquetado web. Primero debe funcionar la versión local. Después se prueba la salida WebAssembly y se corrigen problemas específicos del navegador, como rutas de assets, módulos no disponibles o diferencias de entrada.

El navegador debe recibir la carpeta `build/web/` como raíz estática. No hay que subir el proyecto Python completo como si fuera un backend ni ejecutar `main.py` en un servidor web tradicional.

## 5. Publicar con GitHub Pages

GitHub Pages es una opción natural porque el repositorio ya contiene el código y el resultado de Pygbag es estático.

Primero se genera el contenido web localmente. Luego se publica el contenido de `python_game/build/web/` en una rama o carpeta que GitHub Pages utilice, por ejemplo `gh-pages`. La configuración se realiza desde **Settings → Pages**, seleccionando la rama y la carpeta de publicación correspondientes.

El repositorio no necesita Python en producción. Solo necesita servir los archivos HTML, JavaScript, WebAssembly, datos y assets generados por Pygbag. Si la página se abre desde una subruta, hay que verificar que las rutas internas de los assets sean relativas o estén configuradas para esa ruta.

## 6. Publicar con Vercel

Vercel también puede servir el resultado porque `build/web/` es un sitio estático. No hace falta crear una API, instalar Python en Vercel ni convertir el juego en una aplicación React.

La configuración conceptual es:

| Campo | Valor recomendado |
|---|---|
| Root Directory | `python_game/build/web` después de generar el build, o una carpeta `web/` versionada |
| Framework preset | `Other` / sitio estático |
| Build command | Ninguno si los artefactos ya están versionados; si se automatiza, ejecutar Pygbag antes del deploy |
| Output directory | `.` |
|
En la práctica, para despliegues reproducibles conviene generar `build/web/` en GitHub Actions y publicar el resultado, en lugar de depender de que Vercel tenga Pygbag y sus toolchains disponibles durante cada build. Vercel es opcional; GitHub Pages es suficiente si solo se necesita hosting estático.

## 7. Limitaciones y compatibilidad

Pygbag no convierte automáticamente cualquier programa Python en un juego web compatible. Las dependencias deben tener soporte para WebAssembly o estar disponibles en el entorno de Pygbag. En particular, conviene evitar acceso directo al sistema de archivos, procesos del sistema, sockets bloqueantes y librerías nativas que el navegador no pueda cargar.

Los assets deben cargarse desde rutas incluidas dentro del proyecto. Es preferible usar PNG, JPG o WEBP para imágenes y OGG para audio web, manteniendo el tamaño razonable. Las rutas deben probarse tanto en local como dentro de `build/web/`.

La entrada de teclado y el foco de la ventana pueden comportarse distinto en navegador. La primera pantalla debe explicar los controles y el juego debe responder después de un clic o una interacción inicial del usuario.

## 8. Procedimiento recomendado para este juego

La secuencia correcta para *El Hilo de las Nornas* es:

1. Desarrollar y probar la escena local en `python_game/main.py`.
2. Ejecutar la prueba de humo y una sesión manual de prólogo, ritual y costa.
3. Empaquetar con `pygbag .` desde `python_game/`.
4. Abrir el servidor de prueba que indique Pygbag y comprobar que cargan el canvas, el loop, los assets y el audio.
5. Corregir solo los problemas propios de WebAssembly.
6. Versionar `build/web/` o generarlo automáticamente en CI.
7. Publicar como sitio estático en GitHub Pages o Vercel.

La prioridad debe ser que el juego sea sólido en Python antes de ampliar la infraestructura web. La web es una forma de distribución, no la arquitectura del juego.

## Referencias

[1]: <https://pygame-web.github.io/wiki/pygbag/> "Pygbag — documentación oficial de pygame-web"
[2]: <https://www.pygame.org/docs/> "Pygame — documentación oficial"
[3]: <https://docs.python.org/3/tutorial/> "Python — tutorial oficial"
[4]: <https://pypi.org/project/pygbag/> "PyPI — pygbag"
