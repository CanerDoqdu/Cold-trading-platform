import mongoose from "mongoose";
import { logger } from "./logger/index.ts";

const MONGO_URI = process.env.MONGO_URI;

const log = logger.child({ module: 'dbConnect' });

let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }

  if (!MONGO_URI) {
    throw new Error("Missing MongoDB connection string");
  }

  try {
    // Connection pool options tuned for Vercel serverless (Hobby: ~10 concurrent functions)
    cachedConnection = await mongoose.connect(MONGO_URI, {
      maxPoolSize: 10,           // Vercel Hobby ~10 concurrent fns
      minPoolSize: 2,            // Keep 2 connections warm
      maxIdleTimeMS: 10000,      // 10s idle → close (serverless recycles fast)
      serverSelectionTimeoutMS: 5000,  // Fail fast if DB unreachable (5s)
      socketTimeoutMS: 45000,    // Timeout slow queries after 45s
      heartbeatFrequencyMS: 10000,     // Check server health every 10s
      retryWrites: true,         // Auto-retry failed writes
      retryReads: true,          // Auto-retry failed reads
    });

    mongoose.connection.on("connected", () => {
      log.info("MongoDB connection successful");
    });

    mongoose.connection.on("error", (error) => {
      log.error("MongoDB connection error", { error: error.message });
    });

    mongoose.connection.on("disconnected", () => {
      log.warn("MongoDB connection disconnected");
    });

    return cachedConnection;
  } catch (error) {
    log.error("MongoDB connection failed", { error: error.message });
    throw error;
  }
}

export default connectToDatabase;
