import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"

// middleware to verify access token 

export const authenticate = (
    req: Request, 
    res: Response, 
    next: NextFunction 
) => {
    try {
        
        // reading authorization header 

        const authHeader = req.headers.authorization ; 

        // checking if authorization header exists 

        if(!authHeader){
            return res.status(401).json({
                success: false, 
                message: "Authorization header missing"
            })
        }

        // checking bearer token format 

        if(!authHeader.startsWith("Bearer ")){
            return res.status(401).json({
                success: false, 
                message: "Invalid Authorization header"
            })
        }

        // Extract JWT token 

        const token = authHeader.split(" ")[1] ; 

        // verify token 

        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) ; // non-null asssertion operator. It tells this value wont be null or undefined.Trust me. 

        // Attach logged-in user data to request 

        req.user = decoded as JwtPayload ; 

        // move to next middleware/controller

        next() ; 
    } catch (error) {
        console.error("Authentication error: ", error) ; 

        return res.status(401).json({
            success: false, 
            message: error instanceof Error ? error.message: "Unauthorized"
        })
    }
}