import express, { Request, Response, NextFunction } from "express";
import logger from "./logger";

const app = express();
const PORT = 3000;

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const status = res.statusCode;
    const method = req.method;
    const path = req.path;

    if (status >= 400) {
      logger.error(`${method} ${path} - ${status} (${duration}ms)`);
    } else {
      logger.info(`${method} ${path} - ${status} (${duration}ms)`);
    }
  });

  next();
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req: Request, res: Response) => {
  res.send("your server is pinned");
});

app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});
