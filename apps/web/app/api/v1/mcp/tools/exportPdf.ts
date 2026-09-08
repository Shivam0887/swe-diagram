import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ExportPdfSchema } from '../schemas/mcpSchemas';

export function registerExportPdfTool(server: McpServer) {
  server.tool(
    'export_pdf',
    'Export the diagram to PDF (base64-encoded). Note: PDF export is not currently implemented. Returns an error.',
    ExportPdfSchema.shape,
    async () => {
      throw new Error('PDF export is not currently implemented. Use export_png or render_svg instead.');
    }
  );
}