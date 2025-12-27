import queryParserService from './queryParserService';
import { ParsedMovieQuery } from '../types/search';

export interface SearchParams {
    query: string;
}

export interface SearchResult {
    movies: any[];
    totalCount: number;
    searchType: 'title' | 'year' | 'combined' | 'semantic';
    confidence: number;
}

export interface ParsedQuery {
    titleKeywords: string[];
    yearRange?: {
        min?: number;
        max?: number;
    };
    searchType: 'title' | 'year' | 'combined' | 'semantic';
    confidence: number;
    originalQuery: string;
}

class MovieSearchService {
    async search(params: SearchParams): Promise<SearchResult> {
        try {
            // Parse the query using LLM-powered query parser
            const parsedQuery = await this.parseQuery(params.query);

            // TODO: Implement database search based on parsed query
            const movies = await this.searchDatabase(parsedQuery);

            return {
                movies,
                totalCount: movies.length,
                searchType: parsedQuery.searchType,
                confidence: parsedQuery.confidence
            };
        } catch (error) {
            console.error('Movie search error:', error);
            throw error;
        }
    }

    private async parseQuery(query: string): Promise<ParsedQuery> {
        try {
            // Use the LLM-powered query parser service
            const parsedMovieQuery = await queryParserService.parseMovieQuery(query, {
                fallbackToKeywords: true,
                maxKeywords: 10
            });

            // Convert ParsedMovieQuery to our ParsedQuery interface
            return {
                titleKeywords: parsedMovieQuery.titleKeywords,
                yearRange: parsedMovieQuery.yearRange,
                searchType: parsedMovieQuery.searchType,
                confidence: parsedMovieQuery.confidence,
                originalQuery: parsedMovieQuery.originalQuery
            };
        } catch (error) {
            console.error('Query parsing failed, using fallback:', error);
            // Fallback to basic parsing if query parser fails
            return {
                titleKeywords: [query.trim()],
                searchType: 'title',
                confidence: 0.2,
                originalQuery: query
            };
        }
    }

    private async searchDatabase(parsedQuery: ParsedQuery): Promise<any[]> {
        // TODO: Implement database search logic
        // For now, return empty results
        return [];
    }
}

export default new MovieSearchService();