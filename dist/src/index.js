"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: ".env.dev" });
const movieRoutes_1 = __importDefault(require("./routes/movieRoutes"));
const commentRoutes_1 = __importDefault(require("./routes/commentRoutes"));
const intApp = () => {
    const promise = new Promise((resolve, reject) => {
        app.use(express_1.default.urlencoded({ extended: false }));
        app.use(express_1.default.json());
        app.use("/movie", movieRoutes_1.default);
        app.use("/comment", commentRoutes_1.default);
        const dbUri = process.env.MONGODB_URI;
        if (!dbUri) {
            console.error("MONGODB_URI is not defined in the environment variables.");
            reject(new Error("MONGODB_URI is not defined"));
        }
        else {
            mongoose_1.default
                .connect(dbUri, {})
                .then(() => {
                resolve(app);
            });
        }
        const db = mongoose_1.default.connection;
        db.on("error", (error) => {
            console.error(error);
        });
        db.once("open", () => {
            console.log("Connected to MongoDB");
        });
    });
    return promise;
};
exports.default = intApp;
//# sourceMappingURL=index.js.map