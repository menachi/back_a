"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commentModel_1 = __importDefault(require("../model/commentModel"));
const baseController_1 = __importDefault(require("./baseController"));
const commentController = new baseController_1.default(commentModel_1.default);
exports.default = commentController;
//# sourceMappingURL=commentController.js.map