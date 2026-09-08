import type { McpAuthContext } from '@/lib/mcpAuth';

export interface McpRequestContext {
  auth: McpAuthContext;
  requestId: string;
}