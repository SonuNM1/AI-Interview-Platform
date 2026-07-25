import { Request, Response } from "express";
import {createUserProfile, getUserProfile, updateUserProfile} from "../services/user.service.js"

export const createUser = async (req: Request, res: Response) => {
    try {
        const {id} = req.body ; 
        
        const user = await createUserProfile({id}) ; 

        return res.status(201).json({
            success: true, 
            message: "User profile created successfully", 
            data: user 
        })

    } catch (error) {
        console.error("Create user controller error: ", error) ; 

        return res.status(500).json({
            success: false, 
            message: error instanceof Error ? error.message: "Internal Server Error"
        })
    }
}

export const updateUser = async (req: Request, res: Response) => {
    try {
        const {id} = req.params ; 

        const {
            firstName, 
            lastName, 
            phone, 
            headline, 
            location, 
            bio, 
            github, 
            linkedin
        } = req.body ; 
        
        const user = await updateUserProfile({
            id,
            firstName,
            lastName,
            phone,
            headline,
            location,
            bio,
            github,
            linkedin,
        })

        return res.status(200).json({
            success: true, 
            message: "User profile updated successfully",
            data: user
        })
    } catch (error) {
        console.error("Update user controller error: ", error) ; 

        return res.status(500).json({
            success: false, 
            message: error instanceof Error ? error.message : "Internal Server Error"
        })
    }
}

// Get User Profile Controller 

export const getUser = async (req: Request, res: Response) => {
    try {
        const {id} = req.params ; // get user id from URL params 

        // call service layer 

        const user = await getUserProfile({id}) ;

        // send success response 

        return res.status(200).json({
            success: true, 
            message: "User Profile Fetched Successfully", 
            data: user 
        })

    } catch (error) {
        console.error("Get user controller error: ", error) ; 

        return res.status(500).json({
            success: false, 
            message: error instanceof Error ? error.message: "Internal Server Error"
        })
    }
}

// Get logged-in user profile 

export const getMyProfile = async (
    req: Request, 
    res: Response 
) => {
    try {
        const userId = req.user!.id ; 

        const user = await getUserProfile({
            id: userId 
        })

        return res.status(200).json({
            success: true, 
            message: "Profile fetched successfully", 
            data: user 
        })
    } catch (error) {
        console.error("Get My Profile Error: ", error) ; 

        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Internal Server Error"
        })
    }
}