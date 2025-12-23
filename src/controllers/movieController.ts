import Movie from "../model/movieModel";
import { Request, Response } from "express";
import baseController from "./baseController";
import { AuthRequest, getUserId } from "../middleware/authMiddleware";
import movieSearchService from "../services/movieSearchService";

const movieController = new baseController(Movie);

class MovieController extends baseController {
    constructor() {
        super(Movie);
    }
    async post(req: Request, res: Response): Promise<void> {
        try {
            const userId = getUserId(req as AuthRequest);
            req.body.createdBy = userId;
            return super.post(req, res);
        } catch (error) {
            res.status(401).json({ error: "Unauthorized" });
        }
    }

    async put(req: Request, res: Response): Promise<void> {
        try {
            const userId = getUserId(req as AuthRequest);
            const movie = await Movie.findById(req.params.id);
            if (!movie) {
                res.status(404).json({ error: "Movie not found" });
                return;
            }
            if (movie.createdBy.toString() !== userId) {
                res.status(403).json({ error: "Forbidden" });
                return;
            }
            return super.put(req, res);
        } catch (error) {
            res.status(401).json({ error: "Unauthorized" });
        }
    }

    async del(req: Request, res: Response): Promise<void> {
        try {
            const userId = getUserId(req as AuthRequest);
            const movie = await Movie.findById(req.params.id);
            if (!movie) {
                res.status(404).json({ error: "Movie not found" });
                return;
            }
            if (movie.createdBy.toString() !== userId) {
                res.status(403).json({ error: "Forbidden" });
                return;
            }
            return super.del(req, res);
        } catch (error) {
            res.status(401).json({ error: "Unauthorized" });
        }
    }

    async search(req: Request, res: Response): Promise<void> {
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
            const searchResult = await movieSearchService.search({
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

        } catch (error) {
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
    }
}

export default new MovieController();
