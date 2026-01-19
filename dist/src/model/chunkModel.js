"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const chunkSchema = new mongoose_1.default.Schema({
    docId: {
        type: String,
        required: true,
        index: true,
    },
    chunkIndex: {
        type: Number,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    embedding: {
        type: [Number],
        required: false,
    },
    metadata: {
        type: mongoose_1.default.Schema.Types.Mixed,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});
// Compound index for efficient querying
chunkSchema.index({ docId: 1, chunkIndex: 1 }, { unique: true });
exports.default = mongoose_1.default.model("chunk", chunkSchema);
//# sourceMappingURL=chunkModel.js.map