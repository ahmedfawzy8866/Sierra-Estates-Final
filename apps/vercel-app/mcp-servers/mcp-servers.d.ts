// Type declarations for MCP server configuration files
// These are non-TypeScript config files imported by lib/mcp-registry.ts
declare module '*.mcp' {
  const config: Record<string, unknown>;
  export default config;
  // Allow named exports for MCP server tools
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const mcp_whatsapp_messaging: any;
  export const mcp_sierra_deals: any;
  export const mcp_stripe_payments: any;
  export const mcp_docusign_signing: any;
}
