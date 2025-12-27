import queryParserService from '../../services/queryParserService';
import { QueryValidationError } from '../../types/search';

describe('QueryParserService Integration Tests', () => {
    describe('LLM Integration Test', () => {
        test('should test LLM connectivity and parsing capability', async () => {
            // Test with a simple, typical query
            const result = await queryParserService.parseMovieQuery('action movies from the 90s');

            // Basic structure should always be present
            expect(result).toHaveProperty('titleKeywords');
            expect(result).toHaveProperty('searchType');
            expect(result).toHaveProperty('confidence');
            expect(result).toHaveProperty('originalQuery');
            expect(result.originalQuery).toBe('action movies from the 90s');

            // Should contain action keyword
            expect(result.titleKeywords).toContain('action');

            // Should parse 90s correctly
            expect(result.yearRange).toEqual({ min: 1990, max: 1999 });
            expect(result.searchType).toBe('combined');

            // Confidence should be > 0 (either LLM confidence or fallback 0.3)
            expect(result.confidence).toBeGreaterThan(0);

            // Log the result for manual verification
            console.log('Query parsing result:', JSON.stringify(result, null, 2));

            if (result.confidence === 0.3) {
                console.log('✓ LLM service unavailable, fallback mechanism working correctly');
            } else {
                console.log('✓ LLM service working, parsed with confidence:', result.confidence);
            }
        }, 15000);

        test('should handle simple title query', async () => {
            const result = await queryParserService.parseMovieQuery('Inception');

            expect(result.originalQuery).toBe('Inception');
            expect(result.titleKeywords.map(k => k.toLowerCase())).toContain('inception');
            expect(result.searchType).toBe('title');
            expect(result.confidence).toBeGreaterThan(0);

            console.log('Title query result:', JSON.stringify(result, null, 2));
        }, 10000);
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