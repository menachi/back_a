import request from "supertest";
import intApp from "../../index";
import llmClient from "../../services/llmClient";
import { Express } from "express";

// Mock the LLM client to avoid actual network calls during tests
jest.mock("../../services/llmClient", () => ({
    __esModule: true,
    default: {
        generateResponse: jest.fn(),
        listAvailableModels: jest.fn(),
        isHealthy: jest.fn(),
        testConnection: jest.fn(),
        getConfig: jest.fn()
    }
}));

const mockLLMClient = llmClient as jest.Mocked<typeof llmClient>;

describe("LLMClient Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("generateResponse", () => {
        test("should generate response successfully", async () => {
            const mockResponse = {
                success: true,
                response: "This is a test response",
                model: "llama3.1:8b",
                created_at: "2025-12-23T10:30:00Z",
                done: true
            };

            mockLLMClient.generateResponse.mockResolvedValue(mockResponse);

            const result = await mockLLMClient.generateResponse("Hello world");

            expect(result).toEqual(mockResponse);
            expect(mockLLMClient.generateResponse).toHaveBeenCalledWith("Hello world");
        });

        test("should handle authentication errors", async () => {
            mockLLMClient.generateResponse.mockRejectedValue(
                new Error("Authentication failed")
            );

            await expect(
                mockLLMClient.generateResponse("Hello world")
            ).rejects.toThrow("Authentication failed");
        });

        test("should handle timeout errors", async () => {
            mockLLMClient.generateResponse.mockRejectedValue(
                new Error("Request timeout")
            );

            await expect(
                mockLLMClient.generateResponse("Hello world")
            ).rejects.toThrow("Request timeout");
        });
    });

    describe("listAvailableModels", () => {
        test("should list models successfully", async () => {
            const mockModels = {
                models: [
                    {
                        name: "llama3.1:8b",
                        modified_at: "2025-12-23T10:30:00Z",
                        size: 1234567890,
                        digest: "sha256:abc123",
                        details: {
                            format: "gguf",
                            family: "llama"
                        }
                    }
                ]
            };

            mockLLMClient.listAvailableModels.mockResolvedValue(mockModels);

            const result = await mockLLMClient.listAvailableModels();

            expect(result).toEqual(mockModels);
            expect(mockLLMClient.listAvailableModels).toHaveBeenCalled();
        });
    });

    describe("isHealthy", () => {
        test("should return true when service is healthy", async () => {
            mockLLMClient.isHealthy.mockResolvedValue(true);

            const result = await mockLLMClient.isHealthy();

            expect(result).toBe(true);
            expect(mockLLMClient.isHealthy).toHaveBeenCalled();
        });

        test("should return false when service is unhealthy", async () => {
            mockLLMClient.isHealthy.mockResolvedValue(false);

            const result = await mockLLMClient.isHealthy();

            expect(result).toBe(false);
        });
    });

    describe("testConnection", () => {
        test("should return success for valid connection", async () => {
            const mockResult = {
                success: true,
                message: "Connection successful"
            };

            mockLLMClient.testConnection.mockResolvedValue(mockResult);

            const result = await mockLLMClient.testConnection();

            expect(result.success).toBe(true);
            expect(result.message).toBe("Connection successful");
        });

        test("should return failure for invalid connection", async () => {
            const mockResult = {
                success: false,
                message: "Connection failed"
            };

            mockLLMClient.testConnection.mockResolvedValue(mockResult);

            const result = await mockLLMClient.testConnection();

            expect(result.success).toBe(false);
            expect(result.message).toBe("Connection failed");
        });
    });

    describe("getConfig", () => {
        test("should return configuration without sensitive data", async () => {
            const mockConfig = {
                baseUrl: "http://10.10.248.41",
                username: "student1",
                defaultModel: "llama3.1:8b",
                timeout: 30000,
                maxRetries: 3
            };

            mockLLMClient.getConfig.mockReturnValue(mockConfig);

            const config = mockLLMClient.getConfig();

            expect(config).toEqual(mockConfig);
            expect(config).not.toHaveProperty("password");
        });
    });
});