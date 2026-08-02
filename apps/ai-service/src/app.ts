import express from "express";
import cors from "cors";

import mentorRoutes from "./routes/mentor.routes.js";

const app = express();

app.use(cors());

app.use(express.json());

// health check endpoint

app.get("/health", (_, res) => {
  res.status(200).json({
    success: true,
    message: "AI Service is running.",
  });
});

app.use("/api/v1/mentor", mentorRoutes);

export default app;