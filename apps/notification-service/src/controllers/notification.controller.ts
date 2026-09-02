import { Request, Response } from "express";
import {
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/notification.service.js";

// returns notifications belonging to the authenticated user

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user Id missing",
      });
    }

    const notifications = await getUserNotifications(userId);

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Get notifications error: ", error);

    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};

// marks a notification as read

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const notificationId = req.params.id as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID missing.",
      });
    }

    const notification = await markNotificationAsRead(notificationId, userId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      data: notification,
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);

    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};

// marks every notification belonging to the authenticcated user as read 

export const markAllAsRead = async (
    req: Request, 
    res: Response 
) => {
    try {
        const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID missing.",
      });
    }

    await markAllNotificationsAsRead(userId) ; 

    return res.status(200).json({
        success: true, 
        message: "All notifications marked as read."
    })
    } catch (error) {
      console.error("Mark all notifications as read error: ", error) ; 
      
      return res.status(500).json({
        success: false, 
        message: error instanceof Error ? error.message : "Interal Server Error"
      })
    }
}