import { Request, Response } from "express";
import {
  createPaymentOrder,
  getPaymentHistory,
  verifyPayment,
} from "../services/payment.service.js";
import type {
  CreatePaymentOrderInput,
  VerifyPaymentInput,
} from "../types/payment.types.js";
import { request } from "node:http";

// Creates a razorpay order for the authenticated candidate

export const createPayment = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const input = req.body as CreatePaymentOrderInput;

    const result = await createPaymentOrder(userId, input);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error: any) {
    console.error("Create payment error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to create payment order",
    });
  }
};

// verifies the razorpay checkout response

export const verifyPaymentController = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const input = req.body as VerifyPaymentInput;

    const result = await verifyPayment(userId, input);
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Verify payment error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to verify payment",
    });
  }
};

// returns payment history for the authenticated candidate

export const getPayments = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const result = await getPaymentHistory(userId);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Get payment history error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to fetch payment history",
    });
  }
};
