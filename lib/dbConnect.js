import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI; // Ensure this is set in your environment variables

let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }

  if (!MONGO_URI) {
    throw new Error("Missing MongoDB connection string");
  }

  try {
    cachedConnection = await mongoose.connect(MONGO_URI);

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
