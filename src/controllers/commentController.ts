import Comment from "../model/commentModel";
import { Request, Response } from "express";
import baseController from "./baseController";
import { AuthRequest, getUserId } from "../middleware/authMiddleware";

class CommentController extends baseController {
    constructor() {
        super(Comment);
    }

    async post(req: Request, res: Response): Promise<void> {
        try {
            const userId = getUserId(req as AuthRequest);
            req.body.writerId = userId;
            return super.post(req, res);
        } catch (error) {
            res.status(401).json({ error: "Unauthorized" });
        }
    }

    async put(req: Request, res: Response): Promise<void> {
        try {
            const userId = getUserId(req as AuthRequest);
            const comment = await Comment.findById(req.params.id);
            if (!comment) {
                res.status(404).json({ error: "Comment not found" });
                return;
            }
            if (comment.writerId.toString() !== userId) {
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
            const comment = await Comment.findById(req.params.id);
            if (!comment) {
                res.status(404).json({ error: "Comment not found" });
                return;
            }
            if (comment.writerId.toString() !== userId) {
                res.status(403).json({ error: "Forbidden" });
                return;
            }
            return super.del(req, res);
        } catch (error) {
            res.status(401).json({ error: "Unauthorized" });
        }
    }
}

export default new CommentController();