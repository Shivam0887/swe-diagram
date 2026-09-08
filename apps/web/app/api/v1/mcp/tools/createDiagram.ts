import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CreateDiagramSchema } from '../schemas/mcpSchemas';
import { createEmptyDiagram, addNodeToDiagram, addEdgeToDiagram } from '../diagramUtils';
import { renderService } from '@/lib/services/renderService';

export function registerCreateDiagramTool(server: McpServer) {
  server.tool(
    'create_diagram',
    'Create a new architectural diagram from semantic specification. Returns the canonical DiagramDocument and a base64-encoded SVG preview.',
    CreateDiagramSchema.shape,
    async (params) => {
      let diagram = createEmptyDiagram({
        name: params.name,
        description: params.description,
        theme: params.theme,
        width: params.metadata?.width,
        height: params.metadata?.height,
      });

      if (params.metadata?.background) {
        diagram.metadata.background = params.metadata.background;
      }

      for (const nodeSpec of params.nodes) {
        diagram = addNodeToDiagram(diagram, nodeSpec as any);
      }
      for (const edgeSpec of params.edges) {
        diagram = addEdgeToDiagram(diagram, edgeSpec as any);
      }

      const renderResult = renderService.render(diagram, { theme: params.theme });
      const svgBase64 = Buffer.from(renderResult.svg).toString('base64');

      return {
        content: [{ type: 'text', text: JSON.stringify({ diagram, svgBase64 }) }],
        structuredContent: { diagram, svgBase64 },
      };
    }
  );
}