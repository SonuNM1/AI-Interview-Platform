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
    const { id } = req.body;

    const user = await createUserProfile({ id });

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
    const { id } = req.params;

    const {
      firstName,
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

    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};

// Get User Profile Controller

export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // get user id from URL params

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
    const userId = req.user!.id;

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
    const userId = req.params.id as string;

    const result = await deleteUserProfile(userId);

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

    const oldAvatarFileId = await getUserAvatarFileId(req.user!.id);

    // upload new avatar to File Service

    const uploadedFile = await uploadFileToFileService(req.file, req.user!.id);

    // save new avatar id in PostgreSQL

    const user = await updateUserAvatar({
      userId: req.user!.id,
      avatarFileId: uploadedFile._id,
    });

    // Delete old avatar after database update

    if (oldAvatarFileId) {
      try {
        await deleteFileFromFileService(oldAvatarFileId);
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

    const oldResumeFileId = await getUserResumeFileId(req.user!.id);

    // Upload new resume

    const uploadedFile = await uploadFileToFileService(req.file, req.user!.id);

    // Save new resume id

    const user = await updateUserResume({
      userId: req.user!.id,
      resumeFileId: uploadedFile._id,
    });

    // Delete previous resume
    
    if (oldResumeFileId) {
      try {
        await deleteFileFromFileService(oldResumeFileId);
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
