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
const movieSearchService_1 = __importDefault(require("../services/movieSearchService"));
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
                // 1. Input Validation
                if (!req.body.query || typeof req.body.query !== 'string') {
                    res.status(400).json({ error: "Query is required and must be a string" });
                    return;
                }
                const query = req.body.query.trim();
                if (query.length === 0) {
                    res.status(400).json({ error: "Query cannot be empty" });
                    return;
                }
                if (query.length > 500) {
                    res.status(400).json({ error: "Query too long (max 500 characters)" });
                    return;
                }
                // 2. Service Orchestration
                const searchResult = yield movieSearchService_1.default.search({
                    query
                });
                // 3. Format Response
                const response = {
                    results: searchResult.movies,
                    metadata: {
                        query,
                        totalResults: searchResult.totalCount,
                        searchType: searchResult.searchType,
                        confidence: searchResult.confidence
                    }
                };
                res.status(200).json(response);
            }
            catch (error) {
                // 4. Error Handling
                if (error instanceof Error) {
                    // Log the error for debugging
                    console.error('Search error:', error);
                    // Check for specific error types (when services are implemented)
                    if (error.name === 'ValidationError') {
                        res.status(400).json({ error: error.message });
                        return;
                    }
                    if (error.name === 'LLMServiceError') {
                        res.status(503).json({ error: "Search service temporarily unavailable" });
                        return;
                    }
                }
                // Generic server error
                res.status(500).json({ error: "Internal server error" });
            }
        });
    }
}
exports.default = new MovieController();
//# sourceMappingURL=movieController.js.map