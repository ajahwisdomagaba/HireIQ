import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createHireIqMcpServer } from '../lib/mcp/server';

async function run() {
  const server = createHireIqMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[HireIQ MCP] Server connected and listening on stdio.');
}

run().catch((err) => {
  console.error('[HireIQ MCP] Fatal error running MCP server:', err);
  process.exit(1);
});