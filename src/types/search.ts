// Search Types
export interface ParsedMovieQuery {
    titleKeywords: string[];
    yearRange?: {
        min?: number;
        max?: number;
    };
    searchType: 'title' | 'year' | 'combined' | 'semantic';
    confidence: number;
    originalQuery: string;
}

export interface QueryParsingOptions {
    maxKeywords?: number;
    strictParsing?: boolean;
    fallbackToKeywords?: boolean;
}

// Error Types
export class QueryParsingError extends Error {
    constructor(message: string, public originalQuery?: string, public originalError?: Error) {
        super(message);
        this.name = 'QueryParsingError';
    }
}

export class QueryValidationError extends QueryParsingError {
    constructor(message: string, originalQuery?: string) {
        super(message, originalQuery);
        this.name = 'QueryValidationError';
    }
}