import mongoose from "mongoose";

// Connects the Mock Interview Service to MongoDB.

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    console.log("✅ Mock Interview Service connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};