import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import proxyRoutes from "./routes/proxy.routes.js";
import fileRoutes from "./routes/file.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import interviewRoutes from "./routes/interview.routes.js";
import publicInterviewRoutes from "./routes/public-interview.routes.js";
import mockInterviewRoutes from "./routes/mock-interview.routes.js";

const app = express();

const PORT = Number(process.env.PORT) || 4000;

// Enable CORS 

app.use(cors({
    origin: true,
    credentials: true,
  }),
);

app.get("/health", (_req, res) => {
  return res.status(200).json({
    success: true,
    service: "api-gateway",
    message: "API Gateway is running",
  });
});

app.use("/api/v1", proxyRoutes);

app.use("/api/v1/files", fileRoutes);

app.use("/api/v1/chat", chatRoutes);

app.use("/api/v1/interviews", interviewRoutes);

app.use("/api/v1/public/interviews", publicInterviewRoutes);

app.use("/api/v1/mock-interviews", mockInterviewRoutes);

app.use(express.json());

// Start the API Gateway.

app.listen(PORT, () => {
  console.log(
    `🚀 API Gateway running on http://localhost:${PORT}`,
  );
});