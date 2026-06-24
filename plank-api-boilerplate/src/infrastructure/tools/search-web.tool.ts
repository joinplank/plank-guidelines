import { tool } from '@langchain/core/tools';
import type { StructuredToolInterface } from '@langchain/core/tools';
import { z } from 'zod';

interface TavilyResult {
  title: string;
  url: string;
  content: string;
}

interface TavilyResponse {
  results: TavilyResult[];
}

// Type-erased wrapper avoids TS2589 (excessively deep Zod generic in @langchain/core)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mkTool = tool as (fn: (...args: any[]) => Promise<string>, config: any) => StructuredToolInterface;

const schema = z.object({
  query: z.string().describe('The search query'),
});

export function createSearchWebTool(): StructuredToolInterface {
  return mkTool(
    async ({ query }: z.infer<typeof schema>) => {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
        },
        body: JSON.stringify({ query, max_results: 5 }),
      });

      if (!response.ok) {
        throw new Error(`Tavily search failed: ${response.statusText}`);
      }

      const data = (await response.json()) as TavilyResponse;

      const results = data.results.map((r) => ({
        title: r.title,
        url: r.url,
        snippet: r.content.slice(0, 300),
      }));

      return JSON.stringify(results, null, 2);
    },
    { name: 'search_web', description: 'Search the web for up-to-date information on any topic', schema }
  );
}
