import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AddNodeSchema } from '../schemas/mcpSchemas';
import { addNodeToDiagram } from '../diagramUtils';
import { renderService } from '@/lib/services/renderService';

export function registerAddNodeTool(server: McpServer) {
  server.tool(
    'add_node',
    'Add a semantic node to an existing diagram. Returns the updated DiagramDocument and SVG preview.',
    AddNodeSchema.shape,
    async (params) => {
      const diagram = addNodeToDiagram(params.diagram, params.node as any);

      const renderResult = renderService.render(diagram, { theme: params.theme });
      const svgBase64 = Buffer.from(renderResult.svg).toString('base64');

      return {
        content: [{ type: 'text', text: JSON.stringify({ diagram, svgBase64 }) }],
        structuredContent: { diagram, svgBase64 },
      };
    }
  );
}