import express from "express";
import cors from "cors";
import mockInterviewRoutes from "./routes/mockInterview.routes.js";
import reportRoutes from "./routes/report.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Health check to verify the service is running.

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    service: "Mock Interview Service",
  });
});

app.use("/api/v1/mock-interviews", mockInterviewRoutes);

app.use("/api/v1/mock-interviews", reportRoutes);

export default app;