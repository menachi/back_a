import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
    userId: string;
    iat?: number;
    exp?: number;
}

export interface AuthRequest extends Request {
    user: { _id: string };
}

export interface OptionalAuthRequest extends Request {
    user?: { _id: string };
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Authentication logic here
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const secret: string = process.env.JWT_SECRET || "secretkey";

    try {
        const decoded = jwt.verify(token, secret) as JwtPayload;
        (req as AuthRequest).user = { _id: decoded.userId };
        next();
    } catch (error) {
        return res.status(401).json({ error: "Unauthorized" });
    }
};

// Helper function to safely extract user ID
export const getUserId = (req: AuthRequest): string => {
    if (!req.user || !req.user._id) {
        throw new Error("User not authenticated");
    }
    return req.user._id;
};


export default authMiddleware;