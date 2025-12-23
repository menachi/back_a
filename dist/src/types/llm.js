"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMParsingError = exports.LLMTimeoutError = exports.LLMAuthenticationError = exports.LLMConnectionError = exports.LLMServiceError = void 0;
// Error Types
class LLMServiceError extends Error {
    constructor(message, statusCode, originalError) {
        super(message);
        this.statusCode = statusCode;
        this.originalError = originalError;
        this.name = 'LLMServiceError';
    }
}
exports.LLMServiceError = LLMServiceError;
class LLMConnectionError extends LLMServiceError {
    constructor(message, originalError) {
        super(message, undefined, originalError);
        this.name = 'LLMConnectionError';
    }
}
exports.LLMConnectionError = LLMConnectionError;
class LLMAuthenticationError extends LLMServiceError {
    constructor(message) {
        super(message, 401);
        this.name = 'LLMAuthenticationError';
    }
}
exports.LLMAuthenticationError = LLMAuthenticationError;
class LLMTimeoutError extends LLMServiceError {
    constructor(message) {
        super(message, 408);
        this.name = 'LLMTimeoutError';
    }
}
exports.LLMTimeoutError = LLMTimeoutError;
class LLMParsingError extends LLMServiceError {
    constructor(message, originalError) {
        super(message, undefined, originalError);
        this.name = 'LLMParsingError';
    }
}
exports.LLMParsingError = LLMParsingError;
//# sourceMappingURL=llm.js.map