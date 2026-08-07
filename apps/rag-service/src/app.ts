import express from "express";
import cors from "cors";
import documentRoutes from "./routes/document.routes.js";
import ragRoutes from "./routes/rag.routes.js";

const app = express();

// Parse incoming JSON requests

app.use(express.json());

// Enable Cross-Origin Resource Sharing

app.use(cors());

app.use("/api/v1/documents", documentRoutes);

app.use("/api/v1/rag", ragRoutes);

export default app;