import express, { Request, Response, NextFunction } from "express";
import logger from "./logger";

const app = express();
const PORT = 3000;

// Request logging middleware
// Add this at the bottom of your app
app.use((_req, res) => {
  logger.info(`404 Not Found: ${_req.method} ${_req.originalUrl}`);
  res.status(404).json({ error: "Not found" });
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({"message" : "your server is pinned"});
});

app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});
