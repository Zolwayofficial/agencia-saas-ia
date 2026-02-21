import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { logger } from "@repo/logger";

class MCPClientService {
    private client: Client;
    private transport: SSEClientTransport | null = null;
    private isConnected = false;

    constructor() {
        this.client = new Client(
            {
                name: "agencia-saas-ia-worker",
                version: "1.0.0",
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );
    }

    async connect() {
        if (this.isConnected) return;

        try {
            // In docker-compose, postgres-mcp is accessible via the service name
            // MCP servers usually expose HTTP/SSE or stdio. For stdio in docker we would need to 
            // launch the process, but as a separate service we need it to expose SSE.
            // NOTE: The default @modelcontextprotocol/server-postgres uses STDIO.
            // For this architecture, since it's a separate container, we should ideally use SSE,
            // but if the official server only supports stdio natively, running it as a separate container
            // requires an SSE bridge.

            logger.info({ service: 'mcp-client' }, "Initializing MCP connection...");

            // We will need to adapt this depending on how the MCP server is exposed.
            // For now, this is a placeholder structure for the connection logic.

            const serverUrl = new URL(process.env.MCP_SERVER_URL || "http://postgres-mcp:3000/sse");
            this.transport = new SSEClientTransport(serverUrl);

            await this.client.connect(this.transport);
            this.isConnected = true;
            logger.info({ service: 'mcp-client' }, "Successfully connected to MCP Server");

        } catch (error) {
            logger.error({ service: 'mcp-client', error }, "Failed to connect to MCP Server");
            throw error;
        }
    }

    async getAvailableTools() {
        if (!this.isConnected) await this.connect();
        return await this.client.listTools();
    }

    async executeTool(toolName: string, args: any) {
        if (!this.isConnected) await this.connect();

        logger.info({ service: 'mcp-client', tool: toolName }, "Executing MCP tool");
        const result = await this.client.callTool({
            name: toolName,
            arguments: args
        });

        return result;
    }
}

export const mcpClient = new MCPClientService();
