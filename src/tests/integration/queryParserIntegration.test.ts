import queryParserService from '../../services/queryParserService';
import { QueryValidationError, QueryParsingError } from '../../types/search';

describe('QueryParserService Integration Tests', () => {
    // Skip these tests if LLM service is not available
    const skipIfNoLLM = process.env.SKIP_LLM_TESTS === 'true';
    let llmServiceAvailable = true;

    beforeAll(async () => {
        if (skipIfNoLLM) {
            console.log('Skipping LLM integration tests (SKIP_LLM_TESTS=true)');
            return;
        }

        // Test if LLM service is available
        try {
            const testResult = await queryParserService.parseMovieQuery('test', {
                fallbackToKeywords: false
            });
        } catch (error) {
            if (error instanceof Error && (error.message.includes('503') || error.message.includes('Service Temporarily Unavailable'))) {
                llmServiceAvailable = false;
                console.log('LLM service is temporarily unavailable - testing fallback behavior instead');
            }
        }
    });

    describe('Real LLM Integration', () => {
        test('should parse simple movie title query with real LLM or fallback gracefully', async () => {
            if (skipIfNoLLM) {
                console.log('Skipping: LLM service not available');
                return;
            }

            const result = await queryParserService.parseMovieQuery('Inception');

            expect(result.originalQuery).toBe('Inception');
            expect(result.titleKeywords).toContain('inception');

            if (llmServiceAvailable) {
                expect(result.searchType).toBe('title');
                expect(result.confidence).toBeGreaterThan(0.5);
            } else {
                // Test fallback behavior
                expect(result.searchType).toBe('title');
                expect(result.confidence).toBe(0.3); // Fallback confidence
            }
        }, 30000);

        test('should parse year-based query with real LLM', async () => {
            if (skipIfNoLLM) {
                console.log('Skipping: LLM service not available');
                return;
            }

            const result = await queryParserService.parseMovieQuery('movies from 1995');

            expect(result).toEqual({
                titleKeywords: expect.any(Array),
                yearRange: { min: 1995, max: 1995 },
                searchType: expect.stringMatching(/year|combined/),
                confidence: expect.any(Number),
                originalQuery: 'movies from 1995'
            });
            expect(result.confidence).toBeGreaterThan(0.5);
        }, 30000);

        test('should parse complex combined query with real LLM', async () => {
            if (skipIfNoLLM) {
                console.log('Skipping: LLM service not available');
                return;
            }

            const result = await queryParserService.parseMovieQuery('action movies from the 90s');

            expect(result).toEqual({
                titleKeywords: expect.arrayContaining(['action']),
                yearRange: { min: 1990, max: 1999 },
                searchType: 'combined',
                confidence: expect.any(Number),
                originalQuery: 'action movies from the 90s'
            });
            expect(result.confidence).toBeGreaterThan(0.6);
        }, 30000);

        test('should parse decade query with real LLM', async () => {
            if (skipIfNoLLM) {
                console.log('Skipping: LLM service not available');
                return;
            }

            const result = await queryParserService.parseMovieQuery('sci-fi films from the 2000s');

            expect(result).toEqual({
                titleKeywords: expect.arrayContaining(['sci-fi']),
                yearRange: { min: 2000, max: 2009 },
                searchType: 'combined',
                confidence: expect.any(Number),
                originalQuery: 'sci-fi films from the 2000s'
            });
            expect(result.confidence).toBeGreaterThan(0.6);
        }, 30000);

        test('should handle specific year range with real LLM', async () => {
            if (skipIfNoLLM) {
                console.log('Skipping: LLM service not available');
                return;
            }

            const result = await queryParserService.parseMovieQuery('comedies between 2010 and 2015');

            expect(result).toEqual({
                titleKeywords: expect.arrayContaining(['comedies']),
                yearRange: { min: 2010, max: 2015 },
                searchType: 'combined',
                confidence: expect.any(Number),
                originalQuery: 'comedies between 2010 and 2015'
            });
            expect(result.confidence).toBeGreaterThan(0.6);
        }, 30000);

        test('should parse multiple keywords with real LLM', async () => {
            if (skipIfNoLLM) {
                console.log('Skipping: LLM service not available');
                return;
            }

            const result = await queryParserService.parseMovieQuery('romantic comedy drama films');

            expect(result.titleKeywords.length).toBeGreaterThan(1);
            expect(result.titleKeywords).toEqual(
                expect.arrayContaining(['romantic', 'comedy'])
            );
            expect(result.searchType).toBe('title');
            expect(result.confidence).toBeGreaterThan(0.5);
        }, 30000);
    });

    describe('Fallback Behavior with Real Service', () => {
        test('should fallback gracefully when LLM service is temporarily unavailable', async () => {
            // This test simulates service unavailability by using an invalid endpoint
            // We'll temporarily modify the service to use a bad endpoint
            const originalParseMethod = queryParserService.parseMovieQuery;

            // Mock a temporary failure
            let callCount = 0;
            queryParserService.parseMovieQuery = async function (query: string, options?: any) {
                callCount++;
                if (callCount === 1) {
                    // First call fails
                    throw new Error('LLM service unavailable');
                }
                // Subsequent calls work normally
                return originalParseMethod.call(this, query, options);
            };

            // This should fallback to keyword parsing
            const result = await queryParserService.parseMovieQuery('Matrix action movie');

            expect(result.titleKeywords).toContain('matrix');
            expect(result.titleKeywords).toContain('action');
            expect(result.searchType).toBe('combined');
            expect(result.confidence).toBe(0.3); // Low confidence for fallback

            // Restore original method
            queryParserService.parseMovieQuery = originalParseMethod;
        });
    });

    describe('Performance Tests with Real LLM', () => {
        test('should complete parsing within reasonable time', async () => {
            if (skipIfNoLLM) {
                console.log('Skipping: LLM service not available');
                return;
            }

            const startTime = Date.now();

            await queryParserService.parseMovieQuery('action thriller from 2020');

            const endTime = Date.now();
            const duration = endTime - startTime;

            // Should complete within 15 seconds (allowing for network latency)
            expect(duration).toBeLessThan(15000);
        }, 20000);

        test('should handle concurrent requests', async () => {
            if (skipIfNoLLM) {
                console.log('Skipping: LLM service not available');
                return;
            }

            const queries = [
                'horror movies from the 80s',
                'romantic comedies 2019',
                'sci-fi action thriller'
            ];

            const promises = queries.map(query =>
                queryParserService.parseMovieQuery(query)
            );

            const results = await Promise.all(promises);

            expect(results).toHaveLength(3);
            results.forEach(result => {
                expect(result.titleKeywords).toBeDefined();
                expect(result.confidence).toBeGreaterThan(0);
                expect(result.originalQuery).toBeDefined();
            });
        }, 45000); // Longer timeout for concurrent requests
    });
});