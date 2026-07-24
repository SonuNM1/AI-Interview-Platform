import { JwtPayload } from "jsonwebtoken";

// extend express request interface 

declare global {
    namespace Express {
        interface Request {
            // logged in user's JWT payload 
            user?: string | JwtPayload
        }
    }
}

// making this file a module 

export{}