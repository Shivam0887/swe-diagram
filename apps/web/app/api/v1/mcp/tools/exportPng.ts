import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ExportPngSchema } from '../schemas/mcpSchemas';
import { exportService } from '@/lib/services/exportService';

export function registerExportPngTool(server: McpServer) {
  server.tool(
    'export_png',
    'Export the diagram to PNG (base64-encoded). Returns the DiagramDocument and base64-encoded PNG.',
    ExportPngSchema.shape,
    async (params) => {
      const backgroundOption = params.background === 'none' 
        ? 'none' 
        : params.background === 'theme' 
        ? 'theme' 
        : params.background;

      const pngBuffer = await exportService.png(params.diagram, {
        theme: params.theme,
        scale: params.scale,
        background: backgroundOption as any,
        pageSize: params.pageSize as any,
      });

      const pngBase64 = pngBuffer.toString('base64');

      return {
        content: [{ type: 'text', text: JSON.stringify({ diagram: params.diagram, pngBase64 }) }],
        structuredContent: { diagram: params.diagram, pngBase64 },
      };
    }
  );
}