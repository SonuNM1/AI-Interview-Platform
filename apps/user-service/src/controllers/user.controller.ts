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
  searchCandidateProfiles,
  getMentorProfile,
  getMentorProfiles,
  createMentorRating,
  getMentorRatings,
  getMyMentorProfile,
  updateMentorProfile,
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
    const { id, email, role } = req.body;

    const user = await createUserProfile({ id, email, role });

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
          req.headers["x-user-role"] as string,
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

// search candidates - recruiter action

export const searchCandidates = async (req: Request, res: Response) => {
  try {
    const query = String(req.query.q ?? "").trim();

    if (!query) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const candidates = await searchCandidateProfiles(query);

    return res.status(200).json({
      success: true,
      data: candidates,
    });
  } catch (error) {
    console.error("Search candidates error:", error);

    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};

// returns a single mentor profile

export const getMentor = async (req: Request, res: Response) => {
  try {
    const mentorId = req.params.id as string;

    const mentor = await getMentorProfile(mentorId);

    return res.status(200).json({
      success: true,
      data: mentor,
    });
  } catch (error) {
    console.error("Get mentor profile error: ", error);

    return res.status(404).json({
      success: false,
      message: error instanceof Error ? error.message : "Mentor not found",
    });
  }
};

// returns mentor profiles for mentor discovery. Optional q parameter is searched through Elasticsearch 

export const getMentors = async (
  req: Request,
  res: Response,
) => {
  try {

    // read the optional elasticsearch search query 

    const query = String(
      req.query.q ?? "",
    ).trim();

    const mentors =
      await getMentorProfiles(query); // fetch enabled mentors, using elasticsearch when a query exists 

    return res.status(200).json({
      success: true,
      data: mentors,
    });
  } catch (error) {
    console.error(
      "Get mentors error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch mentors",
    });
  }
};

// Creates or updates a candidate's rating for a mentor

export const rateMentor = async (req: Request, res: Response) => {
  try {
    const candidateId = req.headers["x-user-id"] as string;

    const mentorId = req.params.id as string;

    const { rating, review } = req.body;

    if (!candidateId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID missing",
      });
    }

    const result = await createMentorRating({
      mentorId,
      candidateId,
      rating: Number(rating),
      review,
    });

    return res.status(200).json({
      success: true,
      message: "Mentor rating saved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Rate mentor error: ", error) ; 

    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to rate mentor"
    })
  }
};

// returns ratings and aggregate rating information for a mentor 

export const getMentorRatingList = async (
  req: Request, 
  res: Response  
) => {
  try {
    const mentorId = req.params.id as string;

    const result =
      await getMentorRatings(mentorId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(
      "Get mentor ratings error:",
      error,
    );

    return res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Mentor not found",
    });
  }
}

// Returns the authenticated mentor's marketplace settings

export const getMyMentor = async (
  req: Request,
  res: Response,
) => {
  try {
    // The API Gateway adds the authenticated user's ID.
    const mentorId =
      req.headers["x-user-id"] as string;

    if (!mentorId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID missing",
      });
    }

    // Fetch the mentor's marketplace profile.
    const mentorProfile =
      await getMyMentorProfile(mentorId);

    return res.status(200).json({
      success: true,
      data: mentorProfile,
    });
  } catch (error) {
    console.error(
      "Get my mentor profile error:",
      error,
    );

    return res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Mentor profile not found",
    });
  }
};

// Updates the authenticated mentor's marketplace settings

export const updateMyMentor = async (
  req: Request,
  res: Response,
) => {
  try {
    // The API Gateway adds the authenticated user's ID.
    const mentorId =
      req.headers["x-user-id"] as string;

    if (!mentorId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID missing",
      });
    }

    const {
      monthlyMentorshipAmount,
      mentorshipExpertise,
      mentorshipEnabled,
    } = req.body;

    // Validate the basic request structure before calling the service.
    if (
      !Array.isArray(mentorshipExpertise)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Mentorship expertise must be an array",
      });
    }

    // Save the marketplace configuration.
    const mentorProfile =
      await updateMentorProfile({
        mentorId,
        monthlyMentorshipAmount:
          Number(monthlyMentorshipAmount),
        mentorshipExpertise,
        mentorshipEnabled:
          Boolean(mentorshipEnabled),
      });

    return res.status(200).json({
      success: true,
      message:
        "Mentorship profile updated successfully",
      data: mentorProfile,
    });
  } catch (error) {
    console.error(
      "Update mentor profile error:",
      error,
    );

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update mentor profile",
    });
  }
};