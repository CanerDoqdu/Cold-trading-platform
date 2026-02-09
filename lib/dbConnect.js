import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }

  if (!MONGO_URI) {
    throw new Error("Missing MongoDB connection string");
  }

  try {
    // Connection pool options for high traffic
    // Same approach used by Coinbase, Stripe, etc.
    cachedConnection = await mongoose.connect(MONGO_URI, {
      maxPoolSize: 20,           // Max 20 concurrent connections (default is 5)
      minPoolSize: 5,            // Keep 5 connections warm and ready
      maxIdleTimeMS: 30000,      // Close idle connections after 30s
      serverSelectionTimeoutMS: 5000,  // Fail fast if DB unreachable (5s)
      socketTimeoutMS: 45000,    // Timeout slow queries after 45s
      heartbeatFrequencyMS: 10000,     // Check server health every 10s
      retryWrites: true,         // Auto-retry failed writes
      retryReads: true,          // Auto-retry failed reads
    });

    mongoose.connection.on("connected", () => {
      console.log("MongoDB connection successful!");
    });

    mongoose.connection.on("error", (error) => {
      console.error("MongoDB connection error:", error.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB connection disconnected.");
    });

    return cachedConnection;
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
}

export default connectToDatabase;
