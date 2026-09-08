import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { RenderSvgSchema } from '../schemas/mcpSchemas';
import { renderService } from '@/lib/services/renderService';

export function registerRenderSvgTool(server: McpServer) {
  server.tool(
    'render_svg',
    'Render the diagram to SVG. Returns the DiagramDocument and base64-encoded SVG.',
    RenderSvgSchema.shape,
    async (params) => {
      const renderResult = renderService.render(params.diagram, {
        theme: params.theme,
        width: params.width,
        height: params.height,
      });

      const svgBase64 = Buffer.from(renderResult.svg).toString('base64');

      return {
        content: [{ type: 'text', text: JSON.stringify({ diagram: params.diagram, svgBase64 }) }],
        structuredContent: { diagram: params.diagram, svgBase64 },
      };
    }
  );
}