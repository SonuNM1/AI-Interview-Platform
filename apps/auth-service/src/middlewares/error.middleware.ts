import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";

export const errorHandler = (
    error: unknown, 
    req: Request, 
    res: Response, 
    next: NextFunction 
) => {
    console.error(error) ; 

    // validation error (zod)

    if(error instanceof ZodError) {
        return res.status(400).json({
            success: false, 
            message: "Validation Failed", 
            errors: error.issues 
        })
    }

    // custom application errors 

    if(error instanceof AppError) {
        return res.status(error.statusCode).json({
            success: false, 
            message: error.message 
        })
    }

    // unknown errors 

    return res.status(500).json({
        success: false, 
        message: "Internal Server Error"
    })
}