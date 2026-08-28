import { NextFunction, Request, Response } from "express";
import {
  createInterviewSchema,
  updateInterviewSchema,
} from "../validators/interview.validator.js";
import {
  deleteInterviewService,
  getAllInterviewsService,
  getCandidateInterviewsService,
  publishInterviewService,
  updateInterviewService,
} from "../services/interview.service.js";
import {
  createInterviewService,
  getInterviewByIdService,
} from "../services/interview.service.js";

export const createInterview = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID missing",
      });
    }

    const data = createInterviewSchema.parse(req.body);

    const interview = await createInterviewService({
      ...data,
      createdBy: userId,
    });

    res.status(201).json({
      success: true,
      data: interview,
    });
  } catch (error: any) {
    console.error("Create Interview Error:", error);

    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.flatten().fieldErrors,
      });
    }

    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error" ,
    });
  }
};

export const getInterviewById = async (req: Request, res: Response) => {
  try {
    const id  = req.params.id as string;

    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID missing",
      });
    }

    console.log("Controller id:", id);

    const interview = await getInterviewByIdService(id, userId);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    res.status(200).json({
      success: true,
      data: interview,
    });
  } catch (error) {
    console.error("Get Interview by id error: ", error);

    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};

export const getAllInterviews = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID missing",
      });
    }

    const interviews = await getAllInterviewsService(userId);

    res.status(200).json({
      success: true,
      count: interviews.length,
      data: interviews,
    });
  } catch (error: any) {
    console.error("Get all interviews error: ", error);

    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error"
    });
  }
};

export const updateInterview = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string ; 

    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID missing",
      });
    }

    // Validating and sanitizing the incoming update payload before saving it to the database

    const data = updateInterviewSchema.parse(req.body);

    const interview = await updateInterviewService(id, userId, data);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: interview,
    });
  } catch (error: any) {
    console.error("Update Interview Error: ", error);

    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error"
    });
  }
};

export const deleteInterview = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string ; 

    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID missing",
      });
    }

    const interview = await deleteInterviewService(id, userId);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Interview deleted successfully",
    });
  } catch (error) {
    console.error("Delete Interview Error: ", error);

    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error"
    });
  }
};

export const publishInterview = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string ; 

    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID missing",
      });
    }

    const interview = await publishInterviewService(
      id,
      userId 
    );

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    const shareLink = `${process.env.FRONTEND_URL}/interview/${interview.accessToken}`;

    return res.status(200).json({
      success: true,
      message: "Interview published successfully",
      shareLink,
      data: interview,
    });
  } catch (error: any) {
    console.error("Publish Interview Error: ", error);

    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error"
    });
  }
};

// returns all interviews assigned to the currently authenticated candidate 

export const getCandidateInterviews = async (
  req: Request, 
  res: Response 
) => {
  try {
    const candidateId = req.headers["x-user-id"] as string; // API gateway forwards the authenticated user's ID through this header 

    if(!candidateId) {
      return res.status(401).json({
        success: false, 
        message: "Authenticated user ID missing"
      })
    }

    const interviews = await getCandidateInterviewsService(candidateId) ; 

    return res.status(200).json({
      success: true, 
      count: interviews.length, 
      data: interviews 
    })
  } catch (error) {
    console.error("Get candidate interviews error: ", error) ; 

    return res.status(500).json({
      success: false, 
      message: error instanceof Error ? error.message: "Internal Server Error"
    })
  }
}