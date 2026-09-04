import { Router } from "express";

import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import notificationRoutes from "./notification.routes.js";
import mockInterviewRoutes from "./mock-interview.routes.js";
import ragRoutes from "./rag.routes.js";

const router = Router();

// Auth Service
router.use("/auth", authRoutes);

// User Service
router.use("/users", userRoutes);

// Notification Service
router.use("/notifications", notificationRoutes);

// Mock Interview Service

router.use("/mock-interviews", mockInterviewRoutes);

// RAG Service

router.use("/rag", ragRoutes);

export default router;