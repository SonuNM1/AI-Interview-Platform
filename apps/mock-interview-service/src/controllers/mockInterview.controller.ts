// creates mock interview using the user's uploaded resume

import { Request, Response } from "express";
import {
  createMockInterviewService,
  getMockInterviewService,
  startMockInterviewService,
  submitMockInterviewAnswerService,
} from "../services/mockInterview.service.js";

export const createMockInterview = async (req: Request, res: Response) => {
  try {
    const { userId, documentId } = req.body;

    if (!userId || !documentId) {
      return res.status(400).json({
        success: false,
        message: "userId and documentId are required",
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

    const result = await startMockInterviewService(id);

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
    const { id } = req.params;

    const { answer, answerTranscript, duration } = req.body;

    if (!answer) {
      return res.status(400).json({
        success: false,
        message: "Answer is required",
      });
    }

    const result = await submitMockInterviewAnswerService(
      id as string,
      answer,
      answerTranscript,
      duration,
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

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
    const { id } = req.params;

    const result = await getMockInterviewService(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get Mock Interview Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
