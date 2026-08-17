import { NextFunction, Request, Response } from "express";

// Supported application roles

export type UserRole = "ADMIN" | "RECRUITER" | "CANDIDATE" | "MENTOR";

// Checks whether the authenticated user has one of the allowed roles. Authentication must already have happened before this middleware.

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {

    const userRole = req.headers["x-user-role"] as UserRole;

    console.log("GATEWAY ROLE:", req.headers["x-user-role"]);

    // reject requests where the authenticated identity is missing

    if (!userRole) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user role missing",
      });
    }

     // Admin has unrestricted access to the platform.

    if (userRole === "ADMIN") {
      return next();
    }

    // Check whether the user's role is allowed for this route.

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this resource",
      });
    }

    next() ; 

  };
};
