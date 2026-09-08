import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AddEdgeSchema } from '../schemas/mcpSchemas';
import { addEdgeToDiagram } from '../diagramUtils';
import { renderService } from '@/lib/services/renderService';

export function registerAddEdgeTool(server: McpServer) {
  server.tool(
    'add_edge',
    'Add a connection (edge) between two nodes in the diagram. Returns the updated DiagramDocument and SVG preview.',
    AddEdgeSchema.shape,
    async (params) => {
      const diagram = addEdgeToDiagram(params.diagram, params.edge as any);

      const renderResult = renderService.render(diagram, { theme: params.theme });
      const svgBase64 = Buffer.from(renderResult.svg).toString('base64');

      return {
        content: [{ type: 'text', text: JSON.stringify({ diagram, svgBase64 }) }],
        structuredContent: { diagram, svgBase64 },
      };
    }
  );
}