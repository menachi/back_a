import Comment from "../model/commentModel";
import e, { Request, Response } from "express";
import baseController from "./baseController";


const commentController = new baseController(Comment);

export default commentController