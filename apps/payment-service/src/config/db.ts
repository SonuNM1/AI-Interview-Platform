import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async (): Promise<void> => {
  if (!env.mongodbUri) {
    throw new Error(
      "MONGODB_URI is not configured",
    );
  }

  try {
    await mongoose.connect(env.mongodbUri);

    console.log(
      "✅ Payment Service connected to MongoDB",
    );
  } catch (error) {
    console.error(
      "❌ Payment Service MongoDB connection failed:",
      error,
    );

    process.exit(1);
  }
};