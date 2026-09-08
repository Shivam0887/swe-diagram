import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { DeleteNodeSchema } from '../schemas/mcpSchemas';
import { deleteNodeFromDiagram } from '../diagramUtils';
import { renderService } from '@/lib/services/renderService';

export function registerDeleteNodeTool(server: McpServer) {
  server.tool(
    'delete_node',
    'Delete a node and its connected edges from the diagram. Returns the updated DiagramDocument and SVG preview.',
    DeleteNodeSchema.shape,
    async (params) => {
      const diagram = deleteNodeFromDiagram(params.diagram, params.nodeId);

      const renderResult = renderService.render(diagram, { theme: params.theme });
      const svgBase64 = Buffer.from(renderResult.svg).toString('base64');

      return {
        content: [{ type: 'text', text: JSON.stringify({ diagram, svgBase64 }) }],
        structuredContent: { diagram, svgBase64 },
      };
    }
  );
}