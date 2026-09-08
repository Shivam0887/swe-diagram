import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { UpdateNodeSchema } from '../schemas/mcpSchemas';
import { updateNodeInDiagram } from '../diagramUtils';
import { renderService } from '@/lib/services/renderService';

export function registerUpdateNodeTool(server: McpServer) {
  server.tool(
    'update_node',
    'Update properties of an existing node in the diagram. Returns the updated DiagramDocument and SVG preview.',
    UpdateNodeSchema.shape,
    async (params) => {
      const diagram = updateNodeInDiagram(params.diagram, params.nodeId, params.patches as any);

      const renderResult = renderService.render(diagram, { theme: params.theme });
      const svgBase64 = Buffer.from(renderResult.svg).toString('base64');

      return {
        content: [{ type: 'text', text: JSON.stringify({ diagram, svgBase64 }) }],
        structuredContent: { diagram, svgBase64 },
      };
    }
  );
}