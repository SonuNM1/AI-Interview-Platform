import { Request, Response } from "express";
import { getMockInterviewReport } from "../services/report.service.js";

export const getMockInterviewReportController = async (
  req: Request,
  res: Response,
) => {
  try {
    const id  = req.params.id as string;

    const result = await getMockInterviewReport(id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Get Mock Interview Report Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};