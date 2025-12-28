"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitIntoChunks = void 0;
const splitIntoChunks = (movie, options) => {
    var _a, _b;
    const opts = {
        maxChars: (_a = options === null || options === void 0 ? void 0 : options.maxChars) !== null && _a !== void 0 ? _a : parseInt(process.env.CHUNKS_MAX_CHARS || "100"),
        overlapChars: (_b = options === null || options === void 0 ? void 0 : options.overlapChars) !== null && _b !== void 0 ? _b : parseInt(process.env.CHUNKS_OVERLAP_CHARS || "50"),
    };
    let text = (movie.description || "").trim();
    if (text.length === 0) {
        return [];
    }
    // Normalize whitespace but preserve case and structure
    text = text.replace(/\s+/g, " ");
    // Split into sentences for better semantic boundaries
    const sentences = splitIntoSentences(text);
    const chunks = [];
    let currentChunk = "";
    for (const sentence of sentences) {
        const proposedChunk = currentChunk
            ? `${currentChunk} ${sentence}`
            : sentence;
        if (proposedChunk.length <= opts.maxChars) {
            currentChunk = proposedChunk;
        }
        else {
            // Save current chunk if it exists
            if (currentChunk) {
                chunks.push(currentChunk.trim());
            }
            // Handle sentences that are too long
            if (sentence.length > opts.maxChars) {
                const wordChunks = splitLongText(sentence, opts.maxChars);
                chunks.push(...wordChunks);
                currentChunk = "";
            }
            else {
                currentChunk = sentence;
            }
        }
    }
    // Add the last chunk
    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }
    // Apply overlap with word boundaries
    const overlappedChunks = applyOverlap(chunks, opts.overlapChars);
    return overlappedChunks.map((text, index) => ({
        docId: movie._id,
        chunkIndex: index,
        text: text.trim(),
        metadata: {
            title: movie.title,
            releaseYear: movie.releaseYear,
            createdBy: movie.createdBy,
        }
    }));
};
exports.splitIntoChunks = splitIntoChunks;
function splitIntoSentences(text) {
    // Split on sentence boundaries while preserving the punctuation
    return text
        .split(/(?<=[.!?])\s+/)
        .map(s => s.trim())
        .filter(Boolean);
}
function splitLongText(text, maxChars) {
    const words = text.split(/\s+/);
    const chunks = [];
    let currentChunk = "";
    for (const word of words) {
        const proposedChunk = currentChunk
            ? `${currentChunk} ${word}`
            : word;
        if (proposedChunk.length <= maxChars) {
            currentChunk = proposedChunk;
        }
        else {
            // Save current chunk if it exists
            if (currentChunk) {
                chunks.push(currentChunk);
                currentChunk = word;
            }
            else {
                // Single word longer than maxChars - force split
                if (word.length > maxChars) {
                    chunks.push(word.substring(0, maxChars));
                    const remaining = word.substring(maxChars);
                    chunks.push(...splitLongText(remaining, maxChars));
                }
                else {
                    chunks.push(word);
                }
            }
        }
    }
    if (currentChunk) {
        chunks.push(currentChunk);
    }
    return chunks;
}
function applyOverlap(chunks, overlapChars) {
    if (chunks.length <= 1 || overlapChars <= 0) {
        return chunks;
    }
    const overlappedChunks = [chunks[0]];
    for (let i = 1; i < chunks.length; i++) {
        const prevChunk = chunks[i - 1];
        const currentChunk = chunks[i];
        // Get overlap from previous chunk (last N words that fit in overlapChars)
        const overlap = getWordBasedOverlap(prevChunk, overlapChars);
        const overlappedChunk = overlap
            ? `${overlap} ${currentChunk}`
            : currentChunk;
        overlappedChunks.push(overlappedChunk);
    }
    return overlappedChunks;
}
function getWordBasedOverlap(text, maxChars) {
    if (text.length <= maxChars) {
        return text;
    }
    const words = text.split(/\s+/);
    let overlap = "";
    // Build overlap from the end, respecting word boundaries
    for (let i = words.length - 1; i >= 0; i--) {
        const proposedOverlap = words.slice(i).join(" ");
        if (proposedOverlap.length <= maxChars) {
            overlap = proposedOverlap;
            break; // Take the longest valid overlap
        }
    }
    return overlap;
}
//# sourceMappingURL=chunksSplit.js.map