import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GetDiagramSchema } from '../schemas/mcpSchemas';

export function registerGetDiagramTool(server: McpServer) {
  server.tool(
    'get_diagram',
    'Get the current diagram document (pass-through for inspection). Returns the DiagramDocument unchanged.',
    GetDiagramSchema.shape,
    async (params) => {
      return {
        content: [{ type: 'text', text: JSON.stringify({ diagram: params.diagram }) }],
        structuredContent: { diagram: params.diagram },
      };
    }
  );
}