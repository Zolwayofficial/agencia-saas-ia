/**
 * MCP Client Service — Connects to the MCP Gateway for tool execution
 *
 * Uses Streamable HTTP transport (MCP standard, replaces SSE).
 * Multi-tenant: each organization gets a separate client with scoped permissions.
 * The worker mediates all MCP tool access — agent containers never connect directly.
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { logger } from "@repo/logger";

const MCP_GATEWAY_URL = process.env.MCP_GATEWAY_URL || "http://mcp-gateway:3100/mcp";

export interface McpTool {
    name: string;
    description?: string;
    inputSchema: Record<string, any>;
}

export interface McpToolResult {
    content: Array<{ type: string; text: string }>;
    isError?: boolean;
}

class MCPClientService {
    private clients: Map<string, Client> = new Map();

    /**
     * Get or create an MCP client for a specific organization.
     * Each org gets its own session with scoped permissions via x-organization-id header.
     */
    async getClient(organizationId: string): Promise<Client> {
        const existing = this.clients.get(organizationId);
        if (existing) return existing;

        const client = new Client({
            name: `agencia-worker-${organizationId}`,
            version: "1.0.0",
        });

        const transport = new StreamableHTTPClientTransport(
            new URL(MCP_GATEWAY_URL),
            {
                requestInit: {
                    headers: {
                        'x-organization-id': organizationId,
                    },
                },
            }
        );

        await client.connect(transport);
        this.clients.set(organizationId, client);
        logger.info({ service: 'mcp-client', organizationId }, "MCP client connected to gateway");
        return client;
    }

    /**
     * List all available MCP tools for an organization.
     * Returns tool schemas compatible with LLM function calling.
     */
    async getAvailableTools(organizationId: string): Promise<McpTool[]> {
        try {
            const client = await this.getClient(organizationId);
            const result = await client.listTools();
            return (result.tools || []).map((t: any) => ({
                name: t.name,
                description: t.description,
                inputSchema: t.inputSchema,
            }));
        } catch (err: any) {
            logger.error({ service: 'mcp-client', organizationId, err: err.message }, "Failed to list MCP tools");
            return [];
        }
    }

    /**
     * Execute a specific MCP tool by name with given arguments.
     */
    async executeTool(organizationId: string, toolName: string, args: Record<string, any>): Promise<McpToolResult> {
        try {
            const client = await this.getClient(organizationId);
            logger.info({ service: 'mcp-client', tool: toolName, organizationId }, "Executing MCP tool");

            const result = await client.callTool({
                name: toolName,
                arguments: args,
            });

            return result as McpToolResult;
        } catch (err: any) {
            logger.error({ service: 'mcp-client', tool: toolName, organizationId, err: err.message }, "MCP tool execution failed");
            return {
                content: [{ type: 'text', text: `Tool execution error: ${err.message}` }],
                isError: true,
            };
        }
    }

    /**
     * Disconnect and clean up a client for a specific organization.
     */
    async disconnect(organizationId: string) {
        const client = this.clients.get(organizationId);
        if (client) {
            try {
                await client.close();
            } catch { /* ignore close errors */ }
            this.clients.delete(organizationId);
        }
    }

    /**
     * Disconnect all clients. Used during graceful shutdown.
     */
    async disconnectAll() {
        for (const [orgId] of this.clients) {
            await this.disconnect(orgId);
        }
    }
}

export const mcpClient = new MCPClientService();
