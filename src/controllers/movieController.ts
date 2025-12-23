import Movie from "../model/movieModel";
import { Request, Response } from "express";
import baseController from "./baseController";
import { AuthRequest, getUserId } from "../middleware/authMiddleware";

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
}

export default new MovieController();
