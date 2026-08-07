import mongoose from "mongoose";

// Establishes a connection to MongoDB.

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);

    process.exit(1);
  }
};