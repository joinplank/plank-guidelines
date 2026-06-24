import { tool } from '@langchain/core/tools';
import type { StructuredToolInterface } from '@langchain/core/tools';
import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';

const WORKSPACE = process.env.AGENT_WORKSPACE ?? '/tmp/agent-workspace';

// Type-erased wrapper avoids TS2589 (excessively deep Zod generic in @langchain/core)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mkTool = tool as (fn: (...args: any[]) => Promise<string>, config: any) => StructuredToolInterface;

const schema = z.object({
  operation: z.enum(['read', 'write']).describe('Operation to perform'),
  filename: z.string().describe('Filename without any path separators'),
  content: z.string().optional().describe('Content to write (write operation only)'),
});

export function createIoTool(): StructuredToolInterface {
  return mkTool(
    async ({ operation, filename, content }: z.infer<typeof schema>) => {
      const safePath = path.join(WORKSPACE, path.basename(filename));

      if (operation === 'read') {
        return fs.readFile(safePath, 'utf-8');
      }

      await fs.mkdir(WORKSPACE, { recursive: true });
      await fs.writeFile(safePath, content ?? '', 'utf-8');
      return `Wrote ${content?.length ?? 0} chars to ${filename}`;
    },
    { name: 'io', description: 'Read or write files in the agent workspace directory', schema }
  );
}
