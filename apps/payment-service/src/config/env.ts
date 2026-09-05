import dotenv from "dotenv";

dotenv.config();

/*
 * Loads and exposes the Payment Service environment configuration.
 */

export const env = {
  port: Number(process.env.PORT || 5009),

  mongodbUri: process.env.MONGODB_URI || "",

  razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",

  razorpayKeySecret:
    process.env.RAZORPAY_KEY_SECRET || "",

  razorpayWebhookSecret:
    process.env.RAZORPAY_WEBHOOK_SECRET || "",
};