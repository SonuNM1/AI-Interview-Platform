import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"
import { decode } from "node:punycode";

// Extend express request 

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string; 
            } ; 
        }
    }
}

interface JwtPayload {
    id: string; 
    email: string; 
}

export const authMiddleware = (
    req: Request , 
    res: Response, 
    next: NextFunction 
) => {
    try {
        const authHeader = req.headers.authorization ; 

        if(!authHeader){
            return res.status(401).json({
                success: false, 
                message: "Authorization header missing"
            })
        }

        if(!authHeader.startsWith("Bearer ")){
            return res.status(401).json({
                success: false, 
                message: "Invalid Authorization header"
            })
        }

        const token = authHeader.split(" ")[1] ; 

        const decoded = jwt.verify(
            token, 
            process.env.JWT_ACCESS_SECRET!
        ) as JwtPayload ; 

        req.user = {
            id: decoded.id , 
            email: decoded.email 
        }

        next() ; 

    } catch (error) {
        console.error("Auth middleware error: ", error) ; 

        return res.status(401).json({
            success: false, 
            message: "Invalid or Expired token"
        })
    }
}