import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import notificationRoutes from "./notification.routes.js";

const router = Router();

// Auth Service

router.use("/auth", authRoutes);

// User Service

router.use("/users", userRoutes);

// notification service 

router.use("/notifications", notificationRoutes) 

export default router;