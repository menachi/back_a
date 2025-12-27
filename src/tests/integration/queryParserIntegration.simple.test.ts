import queryParserService from '../../services/queryParserService';
import { QueryValidationError } from '../../types/search';

describe('QueryParserService Integration Tests', () => {
    describe('LLM Integration with Fallback', () => {
        test('should handle LLM service and provide results (with fallback if needed)', async () => {
            const result = await queryParserService.parseMovieQuery('find a moview with name Inception');

            // Basic structure should always be present
            expect(result).toHaveProperty('titleKeywords');
            expect(result).toHaveProperty('searchType');
            expect(result).toHaveProperty('confidence');
            expect(result).toHaveProperty('originalQuery');
            expect(result.originalQuery).toBe('Inception');
            expect(result.titleKeywords).toContain('inception');
        }, 10000);

        test('should parse year-based queries correctly', async () => {
            const result = await queryParserService.parseMovieQuery('movies from 1995');

            expect(result.originalQuery).toBe('movies from 1995');
            expect(result.yearRange).toEqual({ min: 1995, max: 1995 });
            expect(result.searchType).toMatch(/year|combined/);
            expect(result.confidence).toBeGreaterThan(0);
        }, 10000);

        test('should parse decade queries correctly', async () => {
            const result = await queryParserService.parseMovieQuery('action movies from the 90s');

            expect(result.originalQuery).toBe('action movies from the 90s');
            expect(result.titleKeywords).toContain('action');
            expect(result.yearRange).toEqual({ min: 1990, max: 1999 });
            expect(result.searchType).toBe('combined');
            expect(result.confidence).toBeGreaterThan(0);
        }, 10000);

        test('should handle complex queries with multiple keywords', async () => {
            const result = await queryParserService.parseMovieQuery('sci-fi thriller from 2010-2015');

            expect(result.originalQuery).toBe('sci-fi thriller from 2010-2015');
            expect(result.titleKeywords.length).toBeGreaterThan(0);
            expect(result.yearRange).toEqual({ min: 2010, max: 2015 });
            expect(result.searchType).toBe('combined');
            expect(result.confidence).toBeGreaterThan(0);
        }, 10000);

        test('should demonstrate service resilience with multiple queries', async () => {
            // Test multiple queries to show the service handles various inputs
            const queries = [
                'Matrix',
                'comedy movies 2020',
                'horror films from the 80s'
            ];

            const results = await Promise.all(
                queries.map(query => queryParserService.parseMovieQuery(query))
            );

            expect(results).toHaveLength(3);

            results.forEach((result, index) => {
                expect(result.originalQuery).toBe(queries[index]);
                expect(result.titleKeywords).toBeDefined();
                expect(result.titleKeywords.length).toBeGreaterThan(0);
                expect(result.searchType).toBeDefined();
                expect(result.confidence).toBeGreaterThan(0);
            });
        }, 20000);
    });

    describe('Error Handling', () => {
        test('should handle empty queries properly', async () => {
            await expect(
                queryParserService.parseMovieQuery('')
            ).rejects.toThrow(QueryValidationError);
        });

        test('should handle very long queries properly', async () => {
            const longQuery = 'a'.repeat(501);

            await expect(
                queryParserService.parseMovieQuery(longQuery)
            ).rejects.toThrow(QueryValidationError);
        });
    });
});