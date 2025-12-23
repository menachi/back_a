import queryParserService from "../../services/queryParserService";
import llmClient from "../../services/llmClient";
import { QueryParsingError, QueryValidationError } from "../../types/search";

// Mock the LLM client
jest.mock("../../services/llmClient", () => ({
    __esModule: true,
    default: {
        generateResponse: jest.fn(),
    }
}));

const mockLLMClient = llmClient as jest.Mocked<typeof llmClient>;

describe("QueryParserService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("parseMovieQuery", () => {
        test("should parse simple title query successfully", async () => {
            const mockLLMResponse = {
                success: true,
                response: JSON.stringify({
                    titleKeywords: ["Matrix"],
                    searchType: "title",
                    confidence: 0.95,
                    reasoning: "Simple title search"
                }),
                model: "llama3.1:8b",
                created_at: "2025-12-23T10:30:00Z",
                done: true
            };

            mockLLMClient.generateResponse.mockResolvedValue(mockLLMResponse);

            const result = await queryParserService.parseMovieQuery("The Matrix");

            expect(result).toEqual({
                titleKeywords: ["Matrix"],
                searchType: "title",
                confidence: 0.95,
                originalQuery: "The Matrix"
            });

            expect(mockLLMClient.generateResponse).toHaveBeenCalledWith(
                expect.stringContaining("The Matrix"),
                expect.objectContaining({
                    temperature: 0.1,
                    format: 'json',
                    num_predict: 500
                })
            );
        });

        test("should parse combined query with year range", async () => {
            const mockLLMResponse = {
                success: true,
                response: JSON.stringify({
                    titleKeywords: ["action"],
                    yearRange: { min: 1990, max: 1999 },
                    searchType: "combined",
                    confidence: 0.9,
                    reasoning: "Title with year range"
                }),
                model: "llama3.1:8b",
                created_at: "2025-12-23T10:30:00Z",
                done: true
            };

            mockLLMClient.generateResponse.mockResolvedValue(mockLLMResponse);

            const result = await queryParserService.parseMovieQuery("action movies from the 90s");

            expect(result).toEqual({
                titleKeywords: ["action"],
                yearRange: { min: 1990, max: 1999 },
                searchType: "combined",
                confidence: 0.9,
                originalQuery: "action movies from the 90s"
            });
        });

        test("should parse year-only query", async () => {
            const mockLLMResponse = {
                success: true,
                response: JSON.stringify({
                    titleKeywords: [],
                    yearRange: { min: 2010, max: 2010 },
                    searchType: "year",
                    confidence: 0.85,
                    reasoning: "Year-only search"
                }),
                model: "llama3.1:8b",
                created_at: "2025-12-23T10:30:00Z",
                done: true
            };

            mockLLMClient.generateResponse.mockResolvedValue(mockLLMResponse);

            const result = await queryParserService.parseMovieQuery("movies from 2010");

            expect(result).toEqual({
                titleKeywords: [],
                yearRange: { min: 2010, max: 2010 },
                searchType: "year",
                confidence: 0.85,
                originalQuery: "movies from 2010"
            });
        });

        test("should apply maxKeywords option", async () => {
            const mockLLMResponse = {
                success: true,
                response: JSON.stringify({
                    titleKeywords: ["action", "adventure", "sci-fi", "thriller", "drama"],
                    searchType: "title",
                    confidence: 0.8,
                    reasoning: "Multiple keywords"
                }),
                model: "llama3.1:8b",
                created_at: "2025-12-23T10:30:00Z",
                done: true
            };

            mockLLMClient.generateResponse.mockResolvedValue(mockLLMResponse);

            const result = await queryParserService.parseMovieQuery(
                "action adventure sci-fi thriller drama movies",
                { maxKeywords: 3 }
            );

            expect(result.titleKeywords).toHaveLength(3);
            expect(result.titleKeywords).toEqual(["action", "adventure", "sci-fi"]);
        });

        test("should fallback to keyword parsing when LLM fails", async () => {
            mockLLMClient.generateResponse.mockRejectedValue(
                new Error("LLM service unavailable")
            );

            const result = await queryParserService.parseMovieQuery("Matrix action 90s");

            expect(result.titleKeywords).toContain("matrix");
            expect(result.titleKeywords).toContain("action");
            expect(result.yearRange).toEqual({ min: 1990, max: 1999 });
            expect(result.searchType).toBe("combined");
            expect(result.confidence).toBe(0.3); // Low confidence for fallback
        });

        test("should handle empty query validation", async () => {
            await expect(
                queryParserService.parseMovieQuery("")
            ).rejects.toThrow(QueryValidationError);

            await expect(
                queryParserService.parseMovieQuery("   ")
            ).rejects.toThrow(QueryValidationError);
        });

        test("should handle very long query validation", async () => {
            const longQuery = "a".repeat(501);

            await expect(
                queryParserService.parseMovieQuery(longQuery)
            ).rejects.toThrow(QueryValidationError);
        });

        test("should handle invalid LLM response", async () => {
            const mockLLMResponse = {
                success: true,
                response: "invalid json response",
                model: "llama3.1:8b",
                created_at: "2025-12-23T10:30:00Z",
                done: true
            };

            mockLLMClient.generateResponse.mockResolvedValue(mockLLMResponse);

            await expect(
                queryParserService.parseMovieQuery("test query")
            ).rejects.toThrow(QueryParsingError);
        });

        test("should handle LLM service failure without fallback", async () => {
            mockLLMClient.generateResponse.mockRejectedValue(
                new Error("LLM service error")
            );

            await expect(
                queryParserService.parseMovieQuery("test query", { fallbackToKeywords: false })
            ).rejects.toThrow(QueryParsingError);
        });
    });

    describe("validateParsedQuery", () => {
        test("should validate correct parsed query", () => {
            const validQuery = {
                titleKeywords: ["Matrix"],
                searchType: "title" as const,
                confidence: 0.95,
                originalQuery: "The Matrix"
            };

            expect(queryParserService.validateParsedQuery(validQuery)).toBe(true);
        });

        test("should reject query with invalid searchType", () => {
            const invalidQuery = {
                titleKeywords: ["Matrix"],
                searchType: "invalid" as any,
                confidence: 0.95,
                originalQuery: "The Matrix"
            };

            expect(queryParserService.validateParsedQuery(invalidQuery)).toBe(false);
        });

        test("should reject query with invalid confidence", () => {
            const invalidQuery = {
                titleKeywords: ["Matrix"],
                searchType: "title" as const,
                confidence: 1.5, // Invalid confidence > 1
                originalQuery: "The Matrix"
            };

            expect(queryParserService.validateParsedQuery(invalidQuery)).toBe(false);
        });

        test("should reject query with invalid year range", () => {
            const invalidQuery = {
                titleKeywords: ["Matrix"],
                yearRange: { min: 2030, max: 2020 }, // min > max
                searchType: "combined" as const,
                confidence: 0.8,
                originalQuery: "Matrix future"
            };

            expect(queryParserService.validateParsedQuery(invalidQuery)).toBe(false);
        });

        test("should validate query with valid year range", () => {
            const validQuery = {
                titleKeywords: ["action"],
                yearRange: { min: 1990, max: 1999 },
                searchType: "combined" as const,
                confidence: 0.9,
                originalQuery: "action 90s"
            };

            expect(queryParserService.validateParsedQuery(validQuery)).toBe(true);
        });
    });
});