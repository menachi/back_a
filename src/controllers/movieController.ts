import Movie from "../model/movieModel";
import { Request, Response } from "express";
import baseController from "./baseController";
import { AuthRequest } from "../middleware/authMiddleware";
import moviesAiSerach from "../services/movieSearch";

const movieController = new baseController(Movie);

class MovieController extends baseController {
    constructor() {
        super(Movie);
    }

    async post(req: AuthRequest, res: Response) {
        const userId = (req as any).user?._id;
        req.body.createdBy = userId;
        return super.post(req, res);
    }

    async put(req: AuthRequest, res: Response) {
        const userId = (req as any).user?._id;
        const movie = await Movie.findById(req.params.id);
        if (movie?.createdBy.toString() !== userId) {
            res.status(403).json({ error: "Forbidden" });
            return;
        }
        return super.put(req, res);
    }

    async del(req: AuthRequest, res: Response) {
        const userId = (req as any).user?._id;
        const movie = await Movie.findById(req.params.id);
        if (movie?.createdBy.toString() !== userId) {
            res.status(403).json({ error: "Forbidden" });
            return;
        }
        return super.del(req, res);
    }

    async searchAI(req: Request, res: Response) {
        const { query } = req.body;

        // Call the AI search service
        const aiResult = await moviesAiSerach(query);
        if (aiResult) {
            return res.status(200).json({ result: aiResult });
        }
        return res.status(400).json("");
    }
}

export default new MovieController();
