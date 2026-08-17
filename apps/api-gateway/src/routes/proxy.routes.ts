import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";

const router = Router();

// Auth Service

router.use("/auth", authRoutes);

// User Service

router.use("/users", userRoutes);

export default router;