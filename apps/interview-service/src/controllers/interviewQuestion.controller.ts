import { Request, Response } from "express";
import {
  getFirstQuestionService,
  submitCandidateAnswerService,
  getNextQuestionService,
  submitInterviewService,
} from "../services/interviewQuestion.service.js";
import { transcribeCandidateAudio } from "../ai/transcription.service.js";

export const getFirstQuestion = async (req: Request, res: Response) => {
  try {
    const accessToken = req.params.accessToken as string;

    const result = await getFirstQuestionService(accessToken);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: result.data,
    });
  } catch (error: any) {
    console.error("Get first question error: ", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

/* Receives the candidate's recorded audio answer. The controller is responsible for:

1. Receiving the multipart/form-data request 
2. Getting the uploaded audio from req.file 
3. Transcribing the audio 
4. Passing the transcript to the business/service layer

Evaluation and database updates remain inside the service layer
*/

export const submitCandidateAnswer = async (req: Request, res: Response) => {
  try {
    const accessToken = req.params.accessToken as string;

    const audioFile = req.file; // multer places the uploaded audio file inside req.file

    // duration is sent as a normal multipart/form-data field

    const duration = Number(req.body.duration);

    // validate the duration before passing it to the Service

    if (!Number.isFinite(duration) || duration < 0) {
      return res.status(400).json({
        success: false,
        message: "Valid answer duration is required",
      });
    }

    // question number is also sent as multipart/form-data

    const questionNumber = req.body.questionNumber
      ? Number(req.body.questionNumber)
      : undefined;

    // The candidate must provide an audio recording

    if (!audioFile) {
      return res.status(400).json({
        success: false,
        message: "Audio answer is required",
      });
    }

    // make sure the question number is valid

    if (!questionNumber) {
      return res.status(400).json({
        success: false,
        message: "Question number is required",
      });
    }

    // convert the candidate's speech into text. This happens before evaluation because our existing evaluation pipeline works with text

    const answerTranscript = await transcribeCandidateAudio(
      audioFile.buffer,
      audioFile.originalname,
      audioFile.mimetype,
    );

    console.log("🎙️ TRANSCRIPT:", answerTranscript);

    const result = await submitCandidateAnswerService(
      accessToken,
      questionNumber,
      answerTranscript,
      answerTranscript,
      duration,
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Submit Candidate Answer Error:", error);

    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};

export const getNextQuestion = async (req: Request, res: Response) => {
  try {
    const accessToken = req.params.accessToken as string;

    const result = await getNextQuestionService(accessToken);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: result.data,
    });
  } catch (error: any) {
    console.error("Get Next Question Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

/* Handles the candidate request to finish the interview. Ensures all questions are answered before completing the interview.*/

export const submitInterview = async (req: Request, res: Response) => {
  try {
    const accessToken = req.params.accessToken as string;

    const result = await submitInterviewService(accessToken);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Interview completed successfully.",
    });
  } catch (error: any) {
    console.error("Submit Interview Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
