import express, { Request, Response, NextFunction } from "express";
import logger from "./logger";
import { connectMongo, getMongoDb } from "./db/mongo";

const app = express();
const PORT = process.env.PORT;

// Parse JSON request bodies
app.use(express.json());

const mongoStatus = connectMongo()
  .then(() => logger.info("MongoDB connection established"))
  .catch((err) => logger.error(`MongoDB connection error: ${err}`));

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

app.get("/mongo", async (req: Request, res: Response) => {
  try {
    const db = getMongoDb();
    const collection = db.collection("test");
    
    // Fetch all documents with the "des" field
    const documents = await collection.find({}).toArray();
    
    if (documents.length === 0) {
      return res.status(404).json({ message: "No documents found" });
    }
    
    res.status(200).json({ 
      message: "Documents retrieved successfully",
      count: documents.length,
      data: documents 
    });
  } catch (error) {
    logger.error(`Error accessing MongoDB: ${error}`);
    return res.status(500).json({ error: "Failed to access MongoDB" });
  }
})

app.post("/mongo", async (req: Request, res: Response) => {
  try {
    const db = getMongoDb();
    const collection = db.collection("test");
    
    // Validate that "des" field exists and is not empty
    const { des } = req.body;

    
    if (!des || typeof des !== 'string' || des.trim() === '') {
      return res.status(400).json({ error: "Field 'des' is required and must be a non-empty string" });
    }
    
    // Insert document with only "des" field
    const document = { des: des.trim() };
    const result = await collection.insertOne(document);
    
    if (!result.acknowledged) {
      return res.status(500).json({ error: "Failed to create document" });
    }
    
    res.status(201).json({ 
      message: "Document created successfully",
      insertedId: result.insertedId,
      data: {
        _id: result.insertedId,
        des: des.trim()
      }
    });
  } catch (error) {
    logger.error(`Error creating document: ${error}`);
    return res.status(500).json({ error: "Failed to create document" });
  }
})

// Request logging middleware
// Add this at the bottom of your app
app.use((_req, res) => {
  logger.info(`404 Not Found: ${_req.method} ${_req.originalUrl}`);
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});
