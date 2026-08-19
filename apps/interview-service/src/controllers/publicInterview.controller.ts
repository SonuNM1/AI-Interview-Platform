import { Request, Response } from "express";
import { getPublicInterviewService, startInterviewService } from "../services/publicInterview.service.js";

export const getPublicInterview = async (req: Request, res: Response) => {
  try {
    const accessToken = req.params.accessToken as string;

    const result = await getPublicInterviewService(accessToken);

    if (!result.success) {
      return res.status(404).json(result);
    }

    const interview = result.data;

    return res.status(200).json({
      success: true,
      data: {
        title: interview.title,
        description: interview.description,
        role: interview.role,
        skills: interview.skills,
        duration: interview.duration,
        difficulty: interview.difficulty,
        type: interview.type,
      },
    });
  } catch (error) {
    console.error("Get public interview error: ", error) ; 

    return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal Server Error"
    })
  }
};

export const startInterview = async (
    req: Request, 
    res: Response, 
) => {
    try {
        const accessToken = req.params.accessToken as string; // extracting access token

        // starting interview 

        const result = await startInterviewService(accessToken) ; 

        if(!result.success) {
            return res.status(400).json({
                success: false, 
                message: result.message
            })
        }

        return res.status(200).json({
            success: true, 
            message: "Interview started successfully"
        })

    } catch (error: any) {
        console.error("Start Interview Error:", error);

        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Internal Server Error"
        });
    }
}

