import { Request, Response, NextFunction } from "express";
import {
  createUserProfile,
  deleteUserProfile,
  getUserAvatarFileId,
  getUserProfile,
  getUserResumeFileId,
  updateUserAvatar,
  updateUserProfile,
  updateUserResume,
} from "../services/user.service.js";
import {
  deleteFileFromFileService,
  uploadFileToFileService,
} from "../services/file-service.client.js";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export const createUser = async (req: Request, res: Response) => {
  try {
    const { id, email } = req.body;

    const user = await createUserProfile({ id, email });

    return res.status(201).json({
      success: true,
      message: "User profile created successfully",
      data: user,
    });
  } catch (error) {
    console.error("Create user controller error: ", error);

    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string;

    const { id } = req.params;

    if (userId !== id) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own profile",
      });
    }

    const {
      firstName,
      username,
      lastName,
      phone,
      headline,
      location,
      bio,
      github,
      linkedin,
    } = req.body;

    const user = await updateUserProfile({
      id,
      username,
      firstName,
      lastName,
      phone,
      headline,
      location,
      bio,
      github,
      linkedin,
    });

    return res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Update user controller error: ", error);

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        success: false,
        message: "Username already taken",
      });
    }

    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};

// Get User Profile Controller

export const getUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string; // get user id from URL params

    // call service layer

    const user = await getUserProfile({ id });

    // send success response

    return res.status(200).json({
      success: true,
      message: "User Profile Fetched Successfully",
      data: user,
    });
  } catch (error) {
    console.error("Get user controller error: ", error);

    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};

// Get logged-in user profile

export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string;

    const user = await getUserProfile({
      id: userId,
    });

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("Get My Profile Error: ", error);

    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};

// delete user profile - development only

export const deleteUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authenticatedUserId = req.headers["x-user-id"] as string;
    const requestedUserId = req.params.id as string;

    // Users can only delete their own profile

    if (authenticatedUserId !== requestedUserId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own profile",
      });
    }

    const result = await deleteUserProfile(requestedUserId);

    return res.status(200).json({
      success: true,
      message: "User profile deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Uploads the user's avatar to File Service and stores the returned fileId in PostgreSQL

export const uploadAvatarController = async (
  req: MulterRequest,
  res: Response,
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded.",
      });
    }

    // get current avatar before updating

    const oldAvatarFileId = await getUserAvatarFileId(
      req.headers["x-user-id"] as string,
    );

    // upload new avatar to File Service

    const uploadedFile = await uploadFileToFileService(
      req.file,
      req.headers["x-user-id"] as string,
      req.headers["x-user-role"] as string,
    );

    // save new avatar id in PostgreSQL

    const user = await updateUserAvatar({
      userId: req.headers["x-user-id"] as string,
      avatarFileId: uploadedFile._id,
    });

    // Delete old avatar after database update

    if (oldAvatarFileId) {
      try {
        await deleteFileFromFileService(
          oldAvatarFileId,
          req.headers["x-user-id"] as string,
          req.headers["x-user-role"] as string,
        );
      } catch (error) {
        console.error("Failed to delete old avatar: ", error);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Avatar updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Upload avatar controller error:", error);

    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};

// upload the user's resume and update the profile

export const uploadResumeController = async (
  req: MulterRequest,
  res: Response,
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No resume uploaded.",
      });
    }

    // Get existing resume

    const oldResumeFileId = await getUserResumeFileId(
      req.headers["x-user-id"] as string,
    );

    // Upload new resume

    const uploadedFile = await uploadFileToFileService(
      req.file,
      req.headers["x-user-id"] as string,
      req.headers["x-user-role"] as string,
    );

    // Save new resume id

    const user = await updateUserResume({
      userId: req.headers["x-user-id"] as string,
      resumeFileId: uploadedFile._id,
    });

    // Delete previous resume

    if (oldResumeFileId) {
      try {
        await deleteFileFromFileService(
          oldResumeFileId, 
          req.headers["x-user-id"] as string, 
          req.headers["x-user-role"] as string 
        );
      } catch (error) {
        console.error("Failed to delete old resume:", error);
      }
    }
    return res.status(200).json({
      success: true,
      message: "Resume updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Upload resume controller error:", error);

    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};
