import { NextFunction, Request, Response } from "express";
import { createInterviewSchema, updateInterviewSchema } from "../validators/interview.validator.js";
import { deleteInterviewService, getAllInterviewsService, publishInterviewService, updateInterviewService } from "../services/interview.service.js";
import { createInterviewService, getInterviewByIdService} from "../services/interview.service.js";

export const createInterview = async (
    req: Request, 
    res: Response
) => {
    try {
        const data = createInterviewSchema.parse(req.body) ; 

        const interview = await createInterviewService(data) ; 

        res.status(201).json({
            success: true, 
            data: interview
        })
    } catch (error) {
        console.error("Create Interview Error: ", error) ;

        return res.status(500).json({
            success: false, 
            message: error.message || "Internal Server Error"
        })
    }
}

export const getInterviewById = async (
    req: Request, 
    res: Response
) => {
    try {
        const {id} = req.params ; 

        console.log("Controller id:", id);

        const interview = await getInterviewByIdService(id) ; 

        if(!interview){
            return res.status(404).json({
                success: false, 
                message: "Interview not found"
            })
        }

        res.status(200).json({
            success: true, 
            data: interview 
        })
    } catch (error) {
        console.error("Get Interview by id error: ", error) ; 
        
        return res.status(500).json({
            success: false, 
            message: error.message || "Internal Server Error"
        })
    }
}

export const getAllInterviews = async (
    _req: Request, 
    res: Response 
) => {
    try {
        const interviews = await getAllInterviewsService() ; 

        res.status(200).json({
            success: true, 
            count: interviews.length, 
            data: interviews 
        })
    } catch (error: any) {
        console.error("Get all interviews error: ", error) ; 

        return res.status(500).json({
            success: false, 
            message: error.message || "Interal Server Error"
        })
    }
}

export const updateInterview = async (
    req: Request, 
    res: Response 
) => {
    try {
        const {id} = req.params ; 

        // Validating and sanitizing the incoming update payload before saving it to the database 

        const data = updateInterviewSchema.parse(req.body) ; 

        const interview = await updateInterviewService(id, data) ;

        if(!interview){
            return res.status(404).json({
                success: false, 
                message: "Interview not found"
            })
        }

        return res.status(200).json({
            success: true, 
            data: interview 
        })
    } catch (error: any) {
        console.error("Update Interview Error: ", error) ; 

        return res.status(500).json({
            success: false, 
            message: error.message || "Internal Server Error"
        })
    }
}

export const deleteInterview = async (
    req: Request, 
    res: Response 
) => {
    try {
        const {id} = req.params ; 

        const interview = await deleteInterviewService(id) ; 

        if(!interview) {
            return res.status(404).json({
                success: false, 
                message: "Interview not found"
            })
        }

        return res.status(200).json({
            success: true, 
            message: "Interview deleted successfully"
        })
    } catch (error) {
        console.error("Delete Interview Error: ", error) ; 

        return res.status(500).json({
            success: false, 
            message: error.message || "Internal Server Error"
        })
    }
}

export const publishInterview = async (
    req: Request, 
    res: Response 
) => {
    try {
        const {id} = req.params ; 

        const interview = await publishInterviewService(id) ; 

        if(!interview) {
            return res.status(404).json({
                success: false, 
                message: "Interview not found"
            })
        }

        return res.status(200).json({
            success: true, 
            message: "Interview published successfully", 
            data: interview
        })
    } catch (error: any) {
        console.error("Publish Interview Error: ", error) ; 

        return res.status(500).json({
            success: false, 
            message: error.message || "Internal Server Error"
        })
    }
}