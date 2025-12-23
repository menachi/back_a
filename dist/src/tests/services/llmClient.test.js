"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const llmClient_1 = __importDefault(require("../../services/llmClient"));
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
const mockLLMClient = llmClient_1.default;
describe("LLMClient Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe("generateResponse", () => {
        test("should generate response successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockResponse = {
                success: true,
                response: "This is a test response",
                model: "llama3.1:8b",
                created_at: "2025-12-23T10:30:00Z",
                done: true
            };
            mockLLMClient.generateResponse.mockResolvedValue(mockResponse);
            const result = yield mockLLMClient.generateResponse("Hello world");
            expect(result).toEqual(mockResponse);
            expect(mockLLMClient.generateResponse).toHaveBeenCalledWith("Hello world");
        }));
        test("should handle authentication errors", () => __awaiter(void 0, void 0, void 0, function* () {
            mockLLMClient.generateResponse.mockRejectedValue(new Error("Authentication failed"));
            yield expect(mockLLMClient.generateResponse("Hello world")).rejects.toThrow("Authentication failed");
        }));
        test("should handle timeout errors", () => __awaiter(void 0, void 0, void 0, function* () {
            mockLLMClient.generateResponse.mockRejectedValue(new Error("Request timeout"));
            yield expect(mockLLMClient.generateResponse("Hello world")).rejects.toThrow("Request timeout");
        }));
    });
    describe("listAvailableModels", () => {
        test("should list models successfully", () => __awaiter(void 0, void 0, void 0, function* () {
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
            const result = yield mockLLMClient.listAvailableModels();
            expect(result).toEqual(mockModels);
            expect(mockLLMClient.listAvailableModels).toHaveBeenCalled();
        }));
    });
    describe("isHealthy", () => {
        test("should return true when service is healthy", () => __awaiter(void 0, void 0, void 0, function* () {
            mockLLMClient.isHealthy.mockResolvedValue(true);
            const result = yield mockLLMClient.isHealthy();
            expect(result).toBe(true);
            expect(mockLLMClient.isHealthy).toHaveBeenCalled();
        }));
        test("should return false when service is unhealthy", () => __awaiter(void 0, void 0, void 0, function* () {
            mockLLMClient.isHealthy.mockResolvedValue(false);
            const result = yield mockLLMClient.isHealthy();
            expect(result).toBe(false);
        }));
    });
    describe("testConnection", () => {
        test("should return success for valid connection", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockResult = {
                success: true,
                message: "Connection successful"
            };
            mockLLMClient.testConnection.mockResolvedValue(mockResult);
            const result = yield mockLLMClient.testConnection();
            expect(result.success).toBe(true);
            expect(result.message).toBe("Connection successful");
        }));
        test("should return failure for invalid connection", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockResult = {
                success: false,
                message: "Connection failed"
            };
            mockLLMClient.testConnection.mockResolvedValue(mockResult);
            const result = yield mockLLMClient.testConnection();
            expect(result.success).toBe(false);
            expect(result.message).toBe("Connection failed");
        }));
    });
    describe("getConfig", () => {
        test("should return configuration without sensitive data", () => __awaiter(void 0, void 0, void 0, function* () {
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
        }));
    });
});
//# sourceMappingURL=llmClient.test.js.map