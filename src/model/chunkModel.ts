import mongoose from "mongoose";

export type ChunkRecord = {
    _id?: string;
    docId: string;
    chunkIndex: number;
    text: string;
    embedding?: number[];
    metadata?: Record<string, any>;
    createdAt?: Date;
}

const chunkSchema = new mongoose.Schema({
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
        type: mongoose.Schema.Types.Mixed,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

// Compound index for efficient querying
chunkSchema.index({ docId: 1, chunkIndex: 1 }, { unique: true });

export default mongoose.model("chunk", chunkSchema);
