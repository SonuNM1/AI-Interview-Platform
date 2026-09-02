import mongoose from "mongoose";

// Connects the Notification Service to MongoDB.

export const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  await mongoose.connect(mongoUri);

  console.log("✅ Notification Service connected to MongoDB");
};