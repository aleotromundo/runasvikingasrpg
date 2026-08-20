# Despliegue automático en Vercel

El repositorio ya contiene `vercel.json` y una salida web generada por Pygbag en `python_game/build/web/`. Vercel puede servir esos archivos como un sitio estático. La conexión con GitHub se hace una sola vez desde la cuenta de Vercel; después, cada push a `main` genera un nuevo deployment de producción y cada rama o pull request puede generar un Preview Deployment [1].

## Activación única

En [vercel.com/new](https://vercel.com/new), elegí **Import Git Repository**, autorizá GitHub si lo solicita y seleccioná `aleotromundo/runasvikingasrpg`. Usá estos valores:

| Campo | Valor |
|---|---|
| Framework Preset | Other |
| Root Directory | `.` |
| Build Command | vacío |
| Output Directory | vacío |
| Install Command | vacío |
| Deploy | confirmar |

El `vercel.json` de la raíz reescribe `/` hacia `python_game/build/web/index.html` y dirige el resto de los archivos hacia la misma carpeta. También declara headers para `.wasm`, `.data` y JavaScript.

## Flujo después de la conexión

Cuando Vercel termine la primera importación, su panel mostrará una URL de producción y una URL de preview. Cada `git push origin main` dispara el despliegue automático. El juego que se publica es la salida Pygbag que está versionada en `python_game/build/web/`.

Es importante distinguir dos operaciones. Pygbag compila el programa Python/Pygame y genera la salida web; Vercel solamente la sirve. Si se modifica `main.py`, primero hay que ejecutar:

```bash
cd python_game
pygbag .
cd ..
git add python_game/build/web
 git commit -m "Regenerate Pygbag web build"
git push origin main
```

La línea con `git commit` debe escribirse sin el espacio inicial que aparece arriba si se copia literalmente:

```bash
git commit -m "Regenerate Pygbag web build"
```

El push activa Vercel automáticamente.

## Diagnóstico

Si Vercel muestra una página vacía, primero comprobá que `python_game/build/web/index.html` exista en el commit remoto. Si el canvas carga pero el juego no arranca, hacé clic dentro de la página: Pygbag espera una interacción inicial para habilitar el runtime. Si se observan errores de MIME, conservá los headers definidos en `vercel.json`. Si la compilación falla durante Vercel, no agregues Python al proyecto web sin necesidad: usá la salida estática ya generada por Pygbag.

## Estado actual

La salida Pygbag ya fue probada desde un servidor estático y cargó el prólogo real en el navegador. La parte pendiente es la activación de la integración GitHub–Vercel dentro de la cuenta del usuario, porque requiere autorización de esa cuenta. No hace falta Vercel para seguir desarrollando localmente.

## Referencias

[1]: <https://vercel.com/docs/git/vercel-for-github> "Deploying GitHub Projects with Vercel"
[2]: <https://vercel.com/docs/project-configuration/vercel-json> "Static Configuration with vercel.json"
[3]: <https://vercel.com/docs/builds/configure-a-build> "Configuring a Build — Vercel"
