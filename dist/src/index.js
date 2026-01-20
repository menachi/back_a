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
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const swagger_1 = require("./swagger");
const multerRoutes_1 = __importDefault(require("./routes/multerRoutes"));
const intApp = () => {
    const promise = new Promise((resolve, reject) => {
        app.use(express_1.default.urlencoded({ extended: false }));
        app.use(express_1.default.json());
        app.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "*");
            res.header("Access-Control-Allow-Methods", "*");
            next();
        });
        app.use("/public", express_1.default.static("./public"));
        app.use("/upload", multerRoutes_1.default);
        // Swagger Documentation
        app.use("/api-docs", swagger_1.swaggerUi.serve, swagger_1.swaggerUi.setup(swagger_1.specs, {
            explorer: true,
            customCss: ".swagger-ui .topbar { display: none }",
            customSiteTitle: "Movie & Comments API Documentation"
        }));
        // Swagger JSON endpoint
        app.get("/api-docs.json", (req, res) => {
            res.setHeader("Content-Type", "application/json");
            res.send(swagger_1.specs);
        });
        app.use("/movie", movieRoutes_1.default);
        app.use("/comment", commentRoutes_1.default);
        app.use("/auth", authRoutes_1.default);
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