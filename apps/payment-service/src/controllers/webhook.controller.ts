import { Request, Response } from "express";
import {
  processPaymentWebhook,
  verifyWebhookSignature,
} from "../services/payment-webhook.service.js";

// receives and verifies razorpay webhook events

export const razorpayWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers["x-razorpay-signature"] as string;

    if (!signature) {
      return res.status(400).json({
        success: false,
        message: "Webhook signature missing",
      });
    }

    const rawBody = req.body as Buffer;

    const valid = verifyWebhookSignature(rawBody, signature);

    if (!valid) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    const payload = JSON.parse(rawBody.toString("utf8"));

    await processPaymentWebhook(payload.event, payload.payload);

    // acknowledge the webhook quickly

    return res.status(200).json({
      success: true,
    });
  } catch (error: any) {
    console.error("Razorpay webhook error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Webhook processing failed",
    });
  }
};
