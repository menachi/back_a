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
const movieModel_1 = __importDefault(require("../model/movieModel"));
const baseController_1 = __importDefault(require("./baseController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const movieController = new baseController_1.default(movieModel_1.default);
class MovieController extends baseController_1.default {
    constructor() {
        super(movieModel_1.default);
    }
    post(req, res) {
        const _super = Object.create(null, {
            post: { get: () => super.post }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = (0, authMiddleware_1.getUserId)(req);
                req.body.createdBy = userId;
                return _super.post.call(this, req, res);
            }
            catch (error) {
                res.status(401).json({ error: "Unauthorized" });
            }
        });
    }
    put(req, res) {
        const _super = Object.create(null, {
            put: { get: () => super.put }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = (0, authMiddleware_1.getUserId)(req);
                const movie = yield movieModel_1.default.findById(req.params.id);
                if (!movie) {
                    res.status(404).json({ error: "Movie not found" });
                    return;
                }
                if (movie.createdBy.toString() !== userId) {
                    res.status(403).json({ error: "Forbidden" });
                    return;
                }
                return _super.put.call(this, req, res);
            }
            catch (error) {
                res.status(401).json({ error: "Unauthorized" });
            }
        });
    }
    del(req, res) {
        const _super = Object.create(null, {
            del: { get: () => super.del }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = (0, authMiddleware_1.getUserId)(req);
                const movie = yield movieModel_1.default.findById(req.params.id);
                if (!movie) {
                    res.status(404).json({ error: "Movie not found" });
                    return;
                }
                if (movie.createdBy.toString() !== userId) {
                    res.status(403).json({ error: "Forbidden" });
                    return;
                }
                return _super.del.call(this, req, res);
            }
            catch (error) {
                res.status(401).json({ error: "Unauthorized" });
            }
        });
    }
    search(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // TODO: Implement LLM-powered search
                res.status(501).json({ error: "Search functionality not implemented yet" });
            }
            catch (error) {
                res.status(500).json({ error: "Internal server error" });
            }
        });
    }
}
exports.default = new MovieController();
//# sourceMappingURL=movieController.js.map