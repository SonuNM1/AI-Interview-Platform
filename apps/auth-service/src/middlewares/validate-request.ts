import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

/* Generic request validation middleware */

export const validateRequest =
    (schema: ZodType) =>
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {

            req.body = await schema.parseAsync(req.body);

            next();

        } catch (error) {
            next(error);
        }
    };