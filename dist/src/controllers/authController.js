"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../model/userModel"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sendError = (res, message, code) => {
    const errCode = code || 400;
    res.status(errCode).json({ error: message });
};
const generateToken = (userId) => {
    const secret = process.env.JWT_SECRET || "secretkey";
    const exp = parseInt(process.env.JWT_EXPIRES_IN || "3600"); // 1 hour
    const refreshexp = parseInt(process.env.JWT_REFRESH_EXPIRES_IN || "86400"); // 24 hours
    const token = jsonwebtoken_1.default.sign({ userId: userId }, secret, { expiresIn: exp });
    const refreshToken = jsonwebtoken_1.default.sign({ userId: userId }, secret, { expiresIn: refreshexp } // 24 hours
    );
    return { token, refreshToken };
};
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Registration logic here
    const { email, password } = req.body;
    if (!email || !password) {
        return sendError(res, "Email and password are required", 401);
    }
    try {
        const salt = yield bcrypt_1.default.genSalt(10);
        const encryptedPassword = yield bcrypt_1.default.hash(password, salt);
        const user = yield userModel_1.default.create({ email, password: encryptedPassword });
        //generate JWT token
        const secret = process.env.JWT_SECRET || "secretkey";
        const exp = parseInt(process.env.JWT_EXPIRES_IN || "3600"); // 1 hour
        const tokens = generateToken(user._id.toString());
        user.refreshToken.push(tokens.refreshToken);
        yield user.save();
        //send token back to user
        res.status(201).json(tokens);
    }
    catch (error) {
        return sendError(res, "Registration failed", 401);
    }
});
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Login logic here
    const { email, password } = req.body;
    if (!email || !password) {
        return sendError(res, "Email and password are required");
    }
    try {
        const user = yield userModel_1.default.findOne({ email });
        if (!user) {
            return sendError(res, "Invalid email or password");
        }
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return sendError(res, "Invalid email or password");
        }
        //generate JWT token
        const tokens = generateToken(user._id.toString());
        user.refreshToken.push(tokens.refreshToken);
        yield user.save();
        //send token back to user
        res.status(200).json(tokens);
    }
    catch (error) {
        return sendError(res, "Login failed");
    }
});
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return sendError(res, "Refresh token is required", 401);
    }
    try {
        const secret = process.env.JWT_SECRET || "secretkey";
        const decoded = jsonwebtoken_1.default.verify(refreshToken, secret);
        const user = yield userModel_1.default.findById(decoded.userId);
        if (!user) {
            return sendError(res, "Invalid refresh token", 401);
        }
        if (!user.refreshToken.includes(refreshToken)) {
            //remove all refresh tokens from user
            user.refreshToken = [];
            yield user.save();
            return sendError(res, "Invalid refresh token", 401);
        }
        //generate new tokens
        const tokens = generateToken(user._id.toString());
        user.refreshToken.push(tokens.refreshToken);
        //remove old refresh token
        user.refreshToken = user.refreshToken.filter(rt => rt !== refreshToken);
        yield user.save();
        res.status(200).json(tokens);
    }
    catch (error) {
        return sendError(res, "Invalid refresh token", 401);
    }
});
exports.default = {
    register,
    login,
    refreshToken
};
//# sourceMappingURL=authController.js.map