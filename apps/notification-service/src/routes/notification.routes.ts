import { Router } from "express";

import {
  getNotifications,
  markAllAsRead,
  markAsRead,
} from "../controllers/notification.controller.js";

const router: Router = Router();

// Fetch authenticated user's notifications.
router.get("/", getNotifications);

// Mark one notification as read.
router.patch("/:id/read", markAsRead);

// Mark all notifications as read.
router.patch("/read-all", markAllAsRead);

export default router;