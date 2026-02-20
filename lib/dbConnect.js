import mongoose from "mongoose";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";

let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }

  const mongoUri = config.mongoUri;
  if (!mongoUri) {
    logger.fatal("Missing MongoDB connection string", { code: "CONFIG_ERROR" });
    throw new Error("Missing MongoDB connection string");
  }

  try {
    // Connection pool options for high traffic
    // Same approach used by Coinbase, Stripe, etc.
    cachedConnection = await mongoose.connect(mongoUri, {
      maxPoolSize: config.mongoPoolSize,  // from config (default 20)
      minPoolSize: 5,            // Keep 5 connections warm and ready
      maxIdleTimeMS: 30000,      // Close idle connections after 30s
      serverSelectionTimeoutMS: 5000,  // Fail fast if DB unreachable (5s)
      socketTimeoutMS: 45000,    // Timeout slow queries after 45s
      heartbeatFrequencyMS: 10000,     // Check server health every 10s
      retryWrites: true,         // Auto-retry failed writes
      retryReads: true,          // Auto-retry failed reads
    });

    mongoose.connection.on("connected", () => {
      logger.info("MongoDB connected", { poolSize: config.mongoPoolSize });
    });

    mongoose.connection.on("error", (error) => {
      logger.error("MongoDB connection error", { error: error.message, category: "DB_ERROR" });
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });

    return cachedConnection;
  } catch (error) {
    logger.error("MongoDB connection failed", { error: error.message, category: "DB_ERROR" });
    throw error;
  }
}

export default connectToDatabase;
