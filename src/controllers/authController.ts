import { Request, Response } from "express";
import User from "../model/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const sendError = (res: Response, message: string) => {
    res.status(400).json({ error: message });
}

const generateToken = (userId: string): string => {
    const secret: string = process.env.JWT_SECRET || "secretkey";
    const exp: number = parseInt(process.env.JWT_EXPIRES_IN || "3600"); // 1 hour
    return jwt.sign(
        { userId: userId },
        secret,
        { expiresIn: exp }
    );

}
const register = async (req: Request, res: Response) => {
    // Registration logic here
    const { email, password } = req.body;

    if (!email || !password) {
        return sendError(res, "Email and password are required");
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({ email, password: encryptedPassword });

        //generate JWT token
        const secret: string = process.env.JWT_SECRET || "secretkey";
        const exp: number = parseInt(process.env.JWT_EXPIRES_IN || "3600"); // 1 hour
        const token = generateToken(user._id.toString());

        //send token back to user
        res.status(201).json({ "token": token });
    } catch (error) {
        return sendError(res, "Registration failed");
    }
};

const login = async (req: Request, res: Response) => {
    // Login logic here
    const { email, password } = req.body;

    if (!email || !password) {
        return sendError(res, "Email and password are required");
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return sendError(res, "Invalid email or password");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return sendError(res, "Invalid email or password");
        }

        //generate JWT token
        const token = generateToken(user._id.toString());
        //send token back to user
        res.status(200).json({ "token": token });
    } catch (error) {
        return sendError(res, "Login failed");
    }
};

export default {
    register,
    login
};