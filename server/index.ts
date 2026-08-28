// Dirección visual: Amber War Room — el servidor solo entrega el shell React; la atmósfera y el HUD viven en client/.

import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");
  const indexPath = path.join(staticPath, "index.html");

  app.disable("x-powered-by");
  app.use(express.static(staticPath, { index: false }));

  // Fallback SPA sin `app.get("*")`: evita que path-to-regexp rompa el arranque en Express moderno.
  app.use((_req, res, next) => {
    res.sendFile(indexPath, (error) => {
      if (error) next(error);
    });
  });

  app.use((error: NodeJS.ErrnoException, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.headersSent) return next(error);
    console.error("Static server error:", error.message);
    const statusCode = typeof (error as { statusCode?: unknown }).statusCode === "number"
      ? (error as unknown as { statusCode: number }).statusCode
      : 500;
    res.status(statusCode).send("No se pudo cargar la aplicación.");
  });

  const port = Number(process.env.PORT || 3000);
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch((error) => {
  console.error("Server startup error:", error);
  process.exitCode = 1;
});
