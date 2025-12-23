"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserId = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    // Authentication logic here
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "secretkey";
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        req.user = { _id: decoded.userId };
        next();
    }
    catch (error) {
        return res.status(401).json({ error: "Unauthorized" });
    }
};
// Helper function to safely extract user ID
const getUserId = (req) => {
    if (!req.user || !req.user._id) {
        throw new Error("User not authenticated");
    }
    return req.user._id;
};
exports.getUserId = getUserId;
exports.default = authMiddleware;
//# sourceMappingURL=authMiddleware.js.map