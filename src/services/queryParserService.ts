import llmClient from './llmClient';
import {
    ParsedMovieQuery,
    QueryParsingOptions,
    QueryParsingError,
    QueryValidationError
} from '../types/search';
import { LLMServiceError, LLMParsingError } from '../types/llm';

interface LLMQueryResponse {
    titleKeywords: string[];
    yearRange?: {
        min?: number;
        max?: number;
    };
    searchType: 'title' | 'year' | 'combined' | 'semantic';
    confidence: number;
    reasoning?: string;
}

class QueryParserService {
    private readonly systemPrompt = `You are a movie search query analyzer. Your task is to parse natural language queries into structured movie search parameters.

Movie Database Schema:
- title: string (movie title)
- releaseYear: number (year the movie was released)
- createdBy: ObjectId (user who added the movie)

Your Response Format (JSON only):
{
  "titleKeywords": ["keyword1", "keyword2"],
  "yearRange": {"min": 1990, "max": 1999},
  "searchType": "title|year|combined|semantic",
  "confidence": 0.85,
  "reasoning": "Brief explanation of parsing logic"
}

Rules:
1. Extract relevant title keywords (movie names, genres, actors, directors)
2. Parse year references (decades, specific years, ranges)
3. Determine search type:
   - "title": Query focuses on movie names/content
   - "year": Query focuses on release dates
   - "combined": Query has both title and year elements
   - "semantic": Complex query requiring semantic understanding
4. Confidence score (0.0-1.0) based on parsing certainty
5. Keep titleKeywords array concise (max 5 keywords)
6. Only include yearRange if explicitly mentioned

Examples:
Query: "action movies from the 90s"
Response: {"titleKeywords": ["action"], "yearRange": {"min": 1990, "max": 1999}, "searchType": "combined", "confidence": 0.9}

Query: "The Matrix"
Response: {"titleKeywords": ["Matrix"], "searchType": "title", "confidence": 0.95}

Query: "movies released in 2010"
Response: {"yearRange": {"min": 2010, "max": 2010}, "searchType": "year", "confidence": 0.9}`;

    /**
     * Parse natural language movie query into structured search criteria
     */
    async parseMovieQuery(
        query: string,
        options: QueryParsingOptions = {}
    ): Promise<ParsedMovieQuery> {
        try {
            // Validate input
            this.validateQuery(query);

            // Create prompt for LLM
            const prompt = this.buildPrompt(query);

            // Call LLM service
            const llmResponse = await llmClient.generateResponse(prompt, {
                temperature: 0.1, // Low temperature for consistent parsing
                format: 'json',
                num_predict: 500 // Limit response length
            });

            if (!llmResponse.done || !llmResponse.response) {
                throw new QueryParsingError(
                    'LLM service returned invalid response',
                    query
                );
            }

            // Parse and validate LLM response
            const parsedResponse = this.parseLLMResponse(llmResponse.response, query);

            // Apply options and create final result
            const result = this.applyOptions(parsedResponse, query, options);

            return result;

        } catch (error) {
            // Handle different error types
            if (error instanceof QueryParsingError) {
                throw error;
            }

            // LLMParsingError (invalid JSON) should be wrapped as QueryParsingError
            if (error instanceof LLMParsingError) {
                throw new QueryParsingError(
                    error.message,
                    query,
                    error
                );
            }

            // Check for LLM service errors and other errors that should trigger fallback
            const shouldFallback = (
                error instanceof LLMServiceError ||
                (error instanceof Error && (
                    error.message.includes('LLM service unavailable') ||
                    error.message.includes('LLM service error')
                ))
            );

            if (shouldFallback && options.fallbackToKeywords !== false) {
                console.warn('LLM parsing failed, falling back to keyword extraction:', error.message);
                return this.fallbackKeywordParsing(query);
            }

            if (error instanceof LLMServiceError) {
                throw new QueryParsingError(
                    `LLM service error: ${error.message}`,
                    query,
                    error
                );
            }

            throw new QueryParsingError(
                `Unexpected error during query parsing: ${error instanceof Error ? error.message : 'Unknown'}`,
                query,
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * Validate parsed query structure and content
     */
    validateParsedQuery(parsed: ParsedMovieQuery): boolean {
        try {
            // Check required fields
            if (!parsed.titleKeywords || !Array.isArray(parsed.titleKeywords)) {
                return false;
            }

            if (!parsed.searchType || !['title', 'year', 'combined', 'semantic'].includes(parsed.searchType)) {
                return false;
            }

            if (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 1) {
                return false;
            }

            // Validate year range if present
            if (parsed.yearRange) {
                const { min, max } = parsed.yearRange;
                if (min && (typeof min !== 'number' || min < 1888 || min > new Date().getFullYear() + 5)) {
                    return false;
                }
                if (max && (typeof max !== 'number' || max < 1888 || max > new Date().getFullYear() + 5)) {
                    return false;
                }
                if (min && max && min > max) {
                    return false;
                }
            }

            // Validate title keywords
            if (parsed.titleKeywords.length > 10) {
                return false;
            }

            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Build prompt for LLM query parsing
     */
    private buildPrompt(query: string): string {
        return `${this.systemPrompt}

Parse this movie search query:
"${query.trim()}"

Respond with JSON only:`;
    }

    /**
     * Validate input query
     */
    private validateQuery(query: string): void {
        if (!query || typeof query !== 'string') {
            throw new QueryValidationError('Query must be a non-empty string');
        }

        const trimmedQuery = query.trim();
        if (trimmedQuery.length === 0) {
            throw new QueryValidationError('Query cannot be empty', query);
        }

        if (trimmedQuery.length > 500) {
            throw new QueryValidationError('Query too long (max 500 characters)', query);
        }
    }

    /**
     * Parse LLM JSON response
     */
    private parseLLMResponse(response: string, originalQuery: string): LLMQueryResponse {
        try {
            const parsed = JSON.parse(response.trim());

            // Validate response structure
            if (!parsed || typeof parsed !== 'object') {
                throw new Error('Response is not a valid object');
            }

            return parsed as LLMQueryResponse;
        } catch (error) {
            throw new LLMParsingError(
                `Failed to parse LLM JSON response: ${error instanceof Error ? error.message : 'Invalid JSON'}`,
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * Apply parsing options and create final result
     */
    private applyOptions(
        llmResponse: LLMQueryResponse,
        originalQuery: string,
        options: QueryParsingOptions
    ): ParsedMovieQuery {
        let titleKeywords = llmResponse.titleKeywords || [];

        // Apply max keywords limit
        if (options.maxKeywords && titleKeywords.length > options.maxKeywords) {
            titleKeywords = titleKeywords.slice(0, options.maxKeywords);
        }

        // Clean keywords
        titleKeywords = titleKeywords
            .filter(keyword => keyword && keyword.trim().length > 0)
            .map(keyword => keyword.trim());

        const result: ParsedMovieQuery = {
            titleKeywords,
            yearRange: llmResponse.yearRange,
            searchType: llmResponse.searchType || 'title',
            confidence: Math.max(0, Math.min(1, llmResponse.confidence || 0.5)),
            originalQuery: originalQuery.trim()
        };

        // Validate final result
        if (!this.validateParsedQuery(result)) {
            throw new QueryValidationError(
                'Parsed query failed validation',
                originalQuery
            );
        }

        return result;
    }

    /**
     * Fallback keyword parsing when LLM is unavailable
     */
    private fallbackKeywordParsing(query: string): ParsedMovieQuery {
        const trimmedQuery = query.trim().toLowerCase();

        // Simple keyword extraction
        const words = trimmedQuery
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2)
            .slice(0, 5);

        // Simple year detection
        const yearMatches = trimmedQuery.match(/\b(19|20)\d{2}\b/g);
        let yearRange: { min?: number; max?: number } | undefined;

        if (yearMatches && yearMatches.length > 0) {
            const years = yearMatches.map(y => parseInt(y)).sort((a, b) => a - b);
            yearRange = {
                min: years[0],
                max: years[years.length - 1]
            };
        }

        // Decade detection
        if (trimmedQuery.includes('90s') || trimmedQuery.includes('nineties')) {
            yearRange = { min: 1990, max: 1999 };
        } else if (trimmedQuery.includes('80s') || trimmedQuery.includes('eighties')) {
            yearRange = { min: 1980, max: 1989 };
        } else if (trimmedQuery.includes('2000s')) {
            yearRange = { min: 2000, max: 2009 };
        }

        return {
            titleKeywords: words,
            yearRange,
            searchType: yearRange ? 'combined' : 'title',
            confidence: 0.3, // Low confidence for fallback parsing
            originalQuery: query.trim()
        };
    }
}

export default new QueryParserService();