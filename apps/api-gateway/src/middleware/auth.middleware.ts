// this middleware verifies the access token before protected requests reach your microservices

import { NextFunction, Request, Response } from "express";
import jwt, { Jwt, JwtPayload } from "jsonwebtoken";

// middleware that verifies the JWT access token sent by the client in the Authorization header

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization; // read the authorization header

    console.log("GATEWAY AUTH HEADER:", req.headers.authorization);

    // rejecting requests that don't contain an Authorization header

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header missing",
      });
    }

    // make sure the header follows the "Bearer <token> format"

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid Authorization header",
      });
    }

    // extract the JWT from the authorization header

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token missing",
      });
    }

    // verify the token using the same secret used by Auth Service when generating access token

    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET!,
    ) as JwtPayload;

    // Remove any client-supplied identity headers before forwarding.

    delete req.headers["x-user-id"];
    delete req.headers["x-user-email"];
    delete req.headers["x-user-role"];

    // Forward the trusted identity obtained from the verified JWT
    
    req.headers["x-user-id"] = decoded.id;
    req.headers["x-user-email"] = decoded.email;
    req.headers["x-user-role"] = decoded.role;

    next(); // continue to the proxy routes
  } catch (error) {
    console.error("Gateway authentication errro: ", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    });
  }
};
