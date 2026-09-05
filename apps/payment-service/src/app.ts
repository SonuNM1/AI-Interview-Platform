import cors from "cors";
import express from "express";
import paymentRoutes from "./routes/payment.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

// Razorpay webhook must receive the raw request body. Therefore this route is registered before express.json()

app.use("/api/v1/payments/webhooks", express.raw({
  type: "application/json"
}), webhookRoutes) ; 

app.use(express.json());

app.use("/api/v1/payments", paymentRoutes) ; // payment APIs 

app.get("/health", (_req, res) => {
  return res.status(200).json({
    success: true,
    service: "Payment Service",
  });
});

export default app;