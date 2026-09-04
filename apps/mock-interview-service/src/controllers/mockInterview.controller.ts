// creates mock interview using the user's uploaded resume

import { Request, Response } from "express";
import {
  createMockInterviewService,
  getMockInterviewService,
  startMockInterviewService,
  submitMockInterviewAnswerService,
  skipMockInterviewQuestionService,
  endMockInterviewService,
  getMockInterviewHistoryService
} from "../services/mockInterview.service.js";
import { transcribeCandidateAudio } from "../services/transcription.service.js";

export const createMockInterview = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const { documentId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    if (!documentId) {
      return res.status(400).json({
        success: false,
        message: "documentId is required",
      });
    }

    const mockInterview = await createMockInterviewService(userId, documentId);

    return res.status(201).json({
      success: true,
      data: mockInterview,
    });
  } catch (error: any) {
    console.error("Create Mock Interview Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// starts the mock interview and generates the first question

export const startMockInterview = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const result = await startMockInterviewService(id, userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Start Mock Interview Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const submitMockInterviewAnswer = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const id = req.params.id as string; // extracting the mock interview ID from the URL

    const audioFile = req.file; // multer places the uploaded file inside req.file

    // duration is sent as a normal multipart/form-data filed

    const duration = req.body.duration ? Number(req.body.duration) : undefined;

    // making sure the candidate actually submitted an audio recording

    if (!audioFile) {
      return res.status(400).json({
        success: false,
        message: "Audio answer is required",
      });
    }

    // converting the candidate's speech into text before evaluation

    const answerTranscript = await transcribeCandidateAudio(
      audioFile.buffer,
      audioFile.originalname,
      audioFile.mimetype,
    );

    // for now the transcript is also used as the candidate asnwer, this keeps the existing evaluation pipeline unchanged

    const result = await submitMockInterviewAnswerService(
      id,
      userId,
      answerTranscript,
      answerTranscript,
      duration,
    );

    // return validation/business errors from the service

    if (!result.success) {
      return res.status(400).json(result);
    }

    // reutnr the evaluation and next question to the client

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Submit Mock Interview Answer Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const getMockInterview = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const result = await getMockInterviewService(id, userId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get Mock Interview Error:", error);

    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};

// Skips the current mock interview question and moves to the next one

export const skipMockInterviewQuestion = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const id = req.params.id as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const result = await skipMockInterviewQuestionService(
      id,
      userId,
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Skip Mock Interview Question Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// Manually ends a mock interview and generates its report

export const endMockInterview = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const id = req.params.id as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const result = await endMockInterviewService(
      id,
      userId,
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("End Mock Interview Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// Returns the authenticated candidate's previous mock interviews

export const getMockInterviewHistory = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const result = await getMockInterviewHistoryService(
      userId,
    );

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Get Mock Interview History Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};