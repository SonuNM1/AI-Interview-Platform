// creates mock interview using the user's uploaded resume

import { Request, Response } from "express";
import {
  createMockInterviewService,
  getMockInterviewService,
  startMockInterviewService,
  submitMockInterviewAnswerService,
} from "../services/mockInterview.service.js";
import { transcribeCandidateAudio } from "../services/transcription.service.js";

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
    const { id } = req.params; // extracting the mock interview ID from the URL 

    const audioFile = req.file ; // multer places the uploaded file inside req.file 

    // duration is sent as a normal multipart/form-data filed 

    const duration = req.body.duration ? Number(req.body.duration) : undefined ; 

    // making sure the candidate actually submitted an audio recording 

    if(!audioFile) {
      return res.status(400).json({
        success: false,
        message: "Audio answer is required",
      });
    }

    // converting the candidate's speech into text before evaluation 

    const answerTranscript = await transcribeCandidateAudio(
      audioFile.buffer, 
      audioFile.originalname, 
      audioFile.mimetype 
    )

    // for now the transcript is also used as the candidate asnwer, this keeps the existing evaluation pipeline unchanged 

    const result = await submitMockInterviewAnswerService(
      id as string, 
      answerTranscript, 
      answerTranscript, 
      duration 
    )

    // return validation/business errors from the service 

    if(!result.success) {
      return res.status(400).json(result) ; 
    }

    // reutnr the evaluation and next question to the client 

    return res.status(200).json(result)

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
      message: error.message || "Internal Server Error",
    });
  }
};
