import Comment from "../model/commentModel";
import { Request, Response } from "express";
import baseController from "./baseController";
import { AuthRequest } from "../middleware/authMiddleware";

class CommentController extends baseController {
    constructor() {
        super(Comment);
    }

    async post(req: AuthRequest, res: Response) {
        const userId = (req as any).user?._id;
        req.body.writerId = userId;
        return super.post(req, res);
    }

    async put(req: AuthRequest, res: Response) {
        const userId = (req as any).user?._id;
        const comment = await Comment.findById(req.params.id);
        if (comment?.writerId.toString() !== userId) {
            res.status(403).json({ error: "Forbidden" });
            return;
        }
        return super.put(req, res);
    }

    async del(req: AuthRequest, res: Response) {
        const userId = (req as any).user?._id;
        const comment = await Comment.findById(req.params.id);
        if (comment?.writerId.toString() !== userId) {
            res.status(403).json({ error: "Forbidden" });
            return;
        }
        return super.del(req, res);
    }
}

export default new CommentController();