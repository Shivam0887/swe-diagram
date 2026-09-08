import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ApplyLayoutSchema } from '../schemas/mcpSchemas';
import { cloneDiagram } from '../diagramUtils';
import { layoutService } from '@/lib/services/layoutService';
import { renderService } from '@/lib/services/renderService';

export function registerApplyLayoutTool(server: McpServer) {
  server.tool(
    'apply_layout',
    'Apply automatic graph layout (ELK.js) to the diagram. Returns the laid-out DiagramDocument and SVG preview.',
    ApplyLayoutSchema.shape,
    async (params) => {
      const diagram = cloneDiagram(params.diagram);
      
      const layoutedDoc = await layoutService.layout(diagram, {
        direction: params.direction,
        nodeSpacing: params.nodeSpacing,
        layerSpacing: params.layerSpacing,
      });

      const renderResult = renderService.render(layoutedDoc, { theme: params.theme });
      const svgBase64 = Buffer.from(renderResult.svg).toString('base64');

      return {
        content: [{ type: 'text', text: JSON.stringify({ diagram: layoutedDoc, svgBase64 }) }],
        structuredContent: { diagram: layoutedDoc, svgBase64 },
      };
    }
  );
}