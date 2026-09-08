import { Request, Response } from "express";
import { createMentorshipSubscription, verifyMentorshipSubscriptionPayment } from "../services/subscription.service.js";

// creates a monthly mentorship subscription for the authenticated candidate

export const createMentorshipSubscriptionController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const result = await createMentorshipSubscription(userId, req.body);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error: any) {
    console.error("Create mentorship subscription error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to create mentorship subscription",
    });
  }
};

// Verifies the Razorpay Subscription Checkout response

export const verifyMentorshipSubscriptionPaymentController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const {
      razorpaySubscriptionId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    if (
      !razorpaySubscriptionId ||
      !razorpayPaymentId ||
      !razorpaySignature
    ) {
      return res.status(400).json({
        success: false,
        message: "Incomplete Razorpay subscription verification data",
      });
    }

    const result =
      await verifyMentorshipSubscriptionPayment(
        userId,
        {
          razorpaySubscriptionId,
          razorpayPaymentId,
          razorpaySignature,
        },
      );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error(
      "Verify mentorship subscription payment error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to verify mentorship subscription payment",
    });
  }
};