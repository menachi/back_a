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
const sendError = (res, message) => {
    res.status(400).json({ error: message });
};
const generateToken = (userId) => {
    const secret = process.env.JWT_SECRET || "secretkey";
    const exp = parseInt(process.env.JWT_EXPIRES_IN || "3600"); // 1 hour
    return jsonwebtoken_1.default.sign({ userId: userId }, secret, { expiresIn: exp });
};
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Registration logic here
    const { email, password } = req.body;
    if (!email || !password) {
        return sendError(res, "Email and password are required");
    }
    try {
        const salt = yield bcrypt_1.default.genSalt(10);
        const encryptedPassword = yield bcrypt_1.default.hash(password, salt);
        const user = yield userModel_1.default.create({ email, password: encryptedPassword });
        //generate JWT token
        const secret = process.env.JWT_SECRET || "secretkey";
        const exp = parseInt(process.env.JWT_EXPIRES_IN || "3600"); // 1 hour
        const token = generateToken(user._id.toString());
        //send token back to user
        res.status(201).json({ "token": token });
    }
    catch (error) {
        return sendError(res, "Registration failed");
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
        const token = generateToken(user._id.toString());
        //send token back to user
        res.status(200).json({ "token": token });
    }
    catch (error) {
        return sendError(res, "Login failed");
    }
});
exports.default = {
    register,
    login
};
//# sourceMappingURL=authController.js.map