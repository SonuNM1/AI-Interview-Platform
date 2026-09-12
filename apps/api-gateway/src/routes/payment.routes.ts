import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { services } from "../config/services.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

const paymentProxy = createProxyMiddleware({
  target: services.payment,
  changeOrigin: true,
  pathRewrite: (path) => `/api/v1/payments${path}`,
});

// Create a Razorpay order
router.post(
  "/create-order",
  authenticate,
  paymentProxy,
);

// Verify the payment returned by Razorpay Checkout
router.post(
  "/verify",
  authenticate,
  paymentProxy,
);

// Create monthly mentorship subscription
router.post(
  "/subscription/mentorship",
  authenticate,
  paymentProxy,
);

// Verify Razorpay mentorship subscription Checkout response
router.post(
  "/subscription/mentorship/verify",
  authenticate,
  paymentProxy,
);

// Receive Razorpay webhooks
router.post(
  "/webhook",
  paymentProxy,
);

export default router;