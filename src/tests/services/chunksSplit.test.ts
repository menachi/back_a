import { splitIntoChunks } from "../../services/chunksSplit";

beforeAll(() => { });

afterAll(() => { });

describe("Chunks Split Service", () => {
    test("test chunk splitting with basic text", () => {
        const movie = {
            title: "Test Movie",
            releaseYear: 2020,
            createdBy: "user1",
            description: "This is a test movie with a longer description that should be split into multiple chunks. The function should handle this text properly by creating meaningful chunks with appropriate overlap between them."
        }
        const chunks = splitIntoChunks(movie, { maxChars: 50, overlapChars: 15 });
        console.log("Chunks created:", chunks);
        console.log("Total chunks:", chunks.length);
        console.log("Original text length:", movie.description.length);

        // Basic expectations
        expect(chunks.length).toBeGreaterThan(1);
        expect(chunks.length).toBeLessThan(10); // Should be reasonable number

        // Check chunk sizes (allowing for overlap)
        chunks.forEach((chunk, index) => {
            expect(chunk.text.length).toBeGreaterThan(0);
            // First chunk should be <= maxChars, subsequent chunks can be longer due to overlap
            if (index === 0) {
                expect(chunk.text.length).toBeLessThanOrEqual(50);
            } else {
                expect(chunk.text.length).toBeLessThanOrEqual(65); // maxChars + overlapChars
            }
        });

        // Check metadata is preserved
        chunks.forEach(chunk => {
            expect(chunk.metadata.title).toBe("Test Movie");
            expect(chunk.metadata.releaseYear).toBe(2020);
            expect(chunk.metadata.createdBy).toBe("user1");
        });
    });

    test("test chunk splitting with repeated text", () => {
        const movie = {
            title: "Test Movie",
            releaseYear: 2020,
            createdBy: "user1",
            description: "This is a test sentence! ".repeat(20) // 480 characters
        }
        const chunks = splitIntoChunks(movie, { maxChars: 80, overlapChars: 20 });

        expect(chunks.length).toBeGreaterThan(3);
        expect(chunks.length).toBeLessThan(15);

        // Check that chunks have reasonable content
        chunks.forEach(chunk => {
            expect(chunk.text.trim().length).toBeGreaterThan(0);
        });
    });

    test("test empty description", () => {
        const movie = {
            title: "Test Movie",
            releaseYear: 2020,
            createdBy: "user1",
            description: ""
        }
        const chunks = splitIntoChunks(movie);
        expect(chunks.length).toBe(0);
    });

    test("test single short sentence", () => {
        const movie = {
            title: "Test Movie",
            releaseYear: 2020,
            createdBy: "user1",
            description: "Short text."
        }
        const chunks = splitIntoChunks(movie, { maxChars: 50, overlapChars: 10 });
        expect(chunks.length).toBe(1);
        expect(chunks[0].text).toBe("Short text.");
    });
    test("test overlap functionality", () => {
        const movie = {
            title: "Test Movie",
            releaseYear: 2020,
            createdBy: "user1",
            description: "First sentence here. Second sentence goes here. Third sentence follows. Fourth sentence ends it."
        }
        const chunks = splitIntoChunks(movie, { maxChars: 40, overlapChars: 15 });
        console.log("Overlap test chunks:", chunks.map(c => c.text));

        // Should have overlap between chunks
        if (chunks.length > 1) {
            for (let i = 1; i < chunks.length; i++) {
                const currentChunk = chunks[i].text;
                const prevChunk = chunks[i - 1].text;

                // Check if there's some overlap (common words at the end of prev and start of current)
                const prevWords = prevChunk.split(/\s+/);
                const currentWords = currentChunk.split(/\s+/);

                console.log(`Chunk ${i - 1}: "${prevChunk}"`);
                console.log(`Chunk ${i}: "${currentChunk}"`);

                // There should be some overlap
                let hasOverlap = false;
                for (let j = 1; j <= Math.min(prevWords.length, currentWords.length); j++) {
                    const prevEnd = prevWords.slice(-j).join(" ");
                    const currentStart = currentWords.slice(0, j).join(" ");
                    if (prevEnd === currentStart) {
                        hasOverlap = true;
                        break;
                    }
                }

                expect(hasOverlap).toBe(true);
            }
        }
    });
});


