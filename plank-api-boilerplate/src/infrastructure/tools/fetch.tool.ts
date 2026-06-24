import { tool } from '@langchain/core/tools';
import type { StructuredToolInterface } from '@langchain/core/tools';
import { z } from 'zod';
import { truncate } from '../../shared/utils/string.utils';

// Type-erased wrapper avoids TS2589 (excessively deep Zod generic in @langchain/core)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mkTool = tool as (fn: (...args: any[]) => Promise<string>, config: any) => StructuredToolInterface;

const schema = z.object({
  url: z.string().url().describe('The URL to fetch'),
});

export function createFetchTool(): StructuredToolInterface {
  return mkTool(
    async ({ url }: z.infer<typeof schema>) => {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PlankBot/1.0)' },
        signal: AbortSignal.timeout(10_000),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
      }

      const text = await response.text();
      const cleaned = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

      return truncate(cleaned, 4000);
    },
    { name: 'fetch_url', description: 'Fetch and return the text content of a URL', schema }
  );
}
