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
Object.defineProperty(exports, "__esModule", { value: true });
const llm_1 = require("../types/llm");
class LLMClient {
    constructor() {
        this.config = {
            baseUrl: process.env.LLM_BASE_URL || 'http://10.10.248.41',
            username: process.env.LLM_USERNAME || 'student1',
            password: process.env.LLM_PASSWORD || 'pass123',
            defaultModel: process.env.LLM_MODEL || 'llama3.1:8b',
            timeout: parseInt(process.env.LLM_TIMEOUT || '30000'),
            maxRetries: parseInt(process.env.LLM_MAX_RETRIES || '3')
        };
        // Create Base64 encoded auth header
        const credentials = Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64');
        this.authHeader = `Basic ${credentials}`;
    }
    /**
     * Generate response from LLM
     */
    generateResponse(prompt, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = {
                model: this.config.defaultModel,
                prompt: prompt.trim(),
                stream: false,
                format: (options === null || options === void 0 ? void 0 : options.format) || 'json',
                options: Object.assign({ temperature: (options === null || options === void 0 ? void 0 : options.temperature) || 0.7, top_p: (options === null || options === void 0 ? void 0 : options.top_p) || 0.9, num_predict: (options === null || options === void 0 ? void 0 : options.num_predict) || 1000 }, options)
            };
            return this.makeRequest('/api/generate', 'POST', request);
        });
    }
    /**
     * List available models
     */
    listAvailableModels() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.makeRequest('/api/tags', 'GET');
        });
    }
    /**
     * Health check for the LLM service
     */
    isHealthy() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.makeRequest('/api/tags', 'GET');
                return response && typeof response === 'object';
            }
            catch (error) {
                console.error('LLM health check failed:', error);
                return false;
            }
        });
    }
    /**
     * Test connection with a simple prompt
     */
    testConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.generateResponse('Hello', {
                    temperature: 0.1,
                    num_predict: 50
                });
                if (response.success && response.response) {
                    return {
                        success: true,
                        message: 'Connection successful'
                    };
                }
                else {
                    return {
                        success: false,
                        message: 'Invalid response format'
                    };
                }
            }
            catch (error) {
                return {
                    success: false,
                    message: error instanceof Error ? error.message : 'Unknown error'
                };
            }
        });
    }
    /**
     * Make HTTP request with retry logic
     */
    makeRequest(endpoint, method, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${this.config.baseUrl.replace(/\/$/, '')}${endpoint}`;
            for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
                    const requestInit = {
                        method,
                        headers: {
                            'Authorization': this.authHeader,
                            'Content-Type': 'application/json',
                        },
                        signal: controller.signal,
                    };
                    if (method === 'POST' && body) {
                        requestInit.body = JSON.stringify(body);
                    }
                    const response = yield fetch(url, requestInit);
                    clearTimeout(timeoutId);
                    // Handle HTTP errors
                    if (!response.ok) {
                        const errorText = yield response.text().catch(() => 'No error details');
                        if (response.status === 401) {
                            throw new llm_1.LLMAuthenticationError('Authentication failed. Check credentials.');
                        }
                        if (response.status >= 500 && attempt < this.config.maxRetries) {
                            // Retry on server errors
                            yield this.delay(Math.pow(2, attempt) * 1000); // Exponential backoff
                            continue;
                        }
                        throw new llm_1.LLMServiceError(`HTTP ${response.status}: ${errorText}`, response.status);
                    }
                    // Parse JSON response
                    try {
                        return yield response.json();
                    }
                    catch (parseError) {
                        throw new llm_1.LLMParsingError('Failed to parse JSON response', parseError instanceof Error ? parseError : undefined);
                    }
                }
                catch (error) {
                    // Handle network/timeout errors
                    if (error instanceof DOMException && error.name === 'AbortError') {
                        if (attempt < this.config.maxRetries) {
                            yield this.delay(Math.pow(2, attempt) * 1000);
                            continue;
                        }
                        throw new llm_1.LLMTimeoutError(`Request timeout after ${this.config.timeout}ms`);
                    }
                    if (error instanceof TypeError && error.message.includes('fetch')) {
                        if (attempt < this.config.maxRetries) {
                            yield this.delay(Math.pow(2, attempt) * 1000);
                            continue;
                        }
                        throw new llm_1.LLMConnectionError('Failed to connect to LLM service', error);
                    }
                    // Re-throw LLM-specific errors
                    if (error instanceof llm_1.LLMServiceError) {
                        throw error;
                    }
                    // Handle unexpected errors
                    if (attempt < this.config.maxRetries) {
                        yield this.delay(Math.pow(2, attempt) * 1000);
                        continue;
                    }
                    throw new llm_1.LLMServiceError(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown'}`, undefined, error instanceof Error ? error : undefined);
                }
            }
            throw new llm_1.LLMServiceError('Max retries exceeded');
        });
    }
    /**
     * Delay utility for retry backoff
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Get current configuration (for debugging)
     */
    getConfig() {
        return {
            baseUrl: this.config.baseUrl,
            username: this.config.username,
            defaultModel: this.config.defaultModel,
            timeout: this.config.timeout,
            maxRetries: this.config.maxRetries
            // Exclude password for security
        };
    }
}
exports.default = new LLMClient();
//# sourceMappingURL=llmClient.js.map