import { MongoClient, Db, MongoClientOptions } from 'mongodb';
import  logger  from '../logger';

let mongoClient: MongoClient | null = null;
let db: Db | null = null;

/**
 * Initialize MongoDB connection
 * Connection pool is configured for standard server workloads
 */
export async function connectMongo(): Promise<Db> {
  if (db) {
    logger.info('MongoDB already connected, reusing existing connection');
    return db;
  }

  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI environment variable is not set');
  }

  const clientOptions: MongoClientOptions = {
    maxPoolSize: 10,           // Suitable for typical server workloads
    minPoolSize: 2,            // Keep 2 connections warm
    maxIdleTimeMS: 60000,      // Close idle connections after 60s
    connectTimeoutMS: 5000,    // Fail fast if connection takes too long
    socketTimeoutMS: 30000,    // 30s timeout for operations
    serverSelectionTimeoutMS: 5000, // Failover quickly on issues
    retryWrites: true,         // Enable automatic retry
  };

  try {
    mongoClient = new MongoClient(mongoUri, clientOptions);
    await mongoClient.connect();
    
    db = mongoClient.db();
    
    logger.info('MongoDB connected successfully');
    
    return db;
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error}`);
    throw error;
  }
}

/**
 * Get existing database connection
 */
export function getMongoDb(dbName?: string): Db {
  if (!mongoClient) {
    throw new Error('MongoDB not connected. Call connectMongo() first');
  }
  const database = dbName || process.env.MONGO_DB_NAME;
  return mongoClient.db(database);
}

/**
 * Disconnect MongoDB
 */
export async function disconnectMongo(): Promise<void> {
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
    db = null;
    logger.info('MongoDB disconnected');
  }
}

/**
 * Health check for MongoDB connection
 */
export async function mongoHealthCheck(): Promise<boolean> {
  if (!db) return false;
  
  try {
    await db.admin().ping();
    return true;
  } catch (error) {
    logger.error(`MongoDB health check failed: ${error}`);
    return false;
  }
}
