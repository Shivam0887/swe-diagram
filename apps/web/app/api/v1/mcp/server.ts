import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpRequestContext } from './context';
import { registerCreateDiagramTool } from './tools/createDiagram';
import { registerAddNodeTool } from './tools/addNode';
import { registerAddEdgeTool } from './tools/addEdge';
import { registerUpdateNodeTool } from './tools/updateNode';
import { registerDeleteNodeTool } from './tools/deleteNode';
import { registerApplyLayoutTool } from './tools/applyLayout';
import { registerRenderSvgTool } from './tools/renderSvg';
import { registerExportPngTool } from './tools/exportPng';
import { registerExportPdfTool } from './tools/exportPdf';
import { registerGetDiagramTool } from './tools/getDiagram';

export function createMcpServer(context: McpRequestContext): McpServer {
  const server = new McpServer({
    name: 'architectural-diagram-service',
    version: '1.0.0',
  }, {
    capabilities: {
      tools: {},
    },
  });

  registerCreateDiagramTool(server);
  registerAddNodeTool(server);
  registerAddEdgeTool(server);
  registerUpdateNodeTool(server);
  registerDeleteNodeTool(server);
  registerApplyLayoutTool(server);
  registerRenderSvgTool(server);
  registerExportPngTool(server);
  registerExportPdfTool(server);
  registerGetDiagramTool(server);

  return server;
}