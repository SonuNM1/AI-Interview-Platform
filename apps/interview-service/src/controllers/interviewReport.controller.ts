import { Request, Response } from "express";
import { generateInterviewReportService } from "../services/interviewReport.service.js";

export const generateInterviewReport = async (
  req: Request,
  res: Response,
) => {
  try {
    const accessToken = req.params.accessToken as string;

    const result = await generateInterviewReportService(accessToken);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Generate Interview Report error: ", error) ; 

    return res.status(500).json({
        success: false, 
        message: "Internal Server Error"
    })
  }
};
