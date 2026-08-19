import { Request, Response } from "express";
import { getFirstQuestionService, submitCandidateAnswerService, getNextQuestionService,submitInterviewService } from "../services/interviewQuestion.service.js";


export const getFirstQuestion = async (
    req: Request, 
    res: Response 
) => {
    try {
        const accessToken = req.params.accessToken as string ; 

        const result = await getFirstQuestionService(accessToken) ; 

        if(!result.success) {
            return res.status(400).json({
                success: false, 
                message: result.message 
            })
        }

        return res.status(200).json({
            success: true, 
            data: result.data 
        })

    } catch (error: any) {
        console.error("Get first question error: ", error) ; 

        return res.status(500).json({
            success: false, 
            message: error.message || "Internal Server Error"
        })
    }
}

export const submitCandidateAnswer = async (
  req: Request,
  res: Response
) => {
  try {
    const accessToken = req.params.accessToken as string;

    const {
      questionNumber,
      candidateAnswer,
      answerTranscript,
      duration,
    } = req.body;

    const result = await submitCandidateAnswerService(
      accessToken,
      questionNumber,
      candidateAnswer,
      answerTranscript,
      duration
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Candidate answer submitted successfully",
    });

  } catch (error: any) {

    console.error("Submit Candidate Answer Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });

  }

};

export const getNextQuestion = async (
  req: Request,
  res: Response
) => {
  try {
    const accessToken = req.params.accessToken as string;

    const result = await getNextQuestionService(
      accessToken
    );

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

};

/* Handles the candidate request to finish the interview. Ensures all questions are answered before completing the interview.*/

export const submitInterview = async (
  req: Request,
  res: Response
) => {
  try {
    const accessToken = req.params.accessToken as string;

    const result = await submitInterviewService(accessToken)

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