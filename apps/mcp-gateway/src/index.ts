/**
 * MCP Gateway — Exposes database and CRM tools via Streamable HTTP
 *
 * Architecture:
 *   - Per-request McpServer instances (stateless, scalable)
 *   - Multi-tenant via x-organization-id header
 *   - Read-only DB access (defense in depth with readonly PG user)
 *   - Streamable HTTP transport (MCP standard, replaces SSE)
 */

import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { registerPostgresTools } from './tools/postgres';
import { registerTwentyTools } from './tools/twenty';
import { logger } from '@repo/logger';

const app = express();
app.use(express.json());

// ── Health Check ──────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'mcp-gateway',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// ── MCP Endpoint ──────────────────────────────────────
app.all('/mcp', async (req, res) => {
    const orgId = req.headers['x-organization-id'] as string || 'system';

    try {
        const server = new McpServer({
            name: 'agencia-mcp-gateway',
            version: '1.0.0',
        });

        // Register tools with org-scoped context
        registerPostgresTools(server, orgId);
        registerTwentyTools(server, orgId);

        const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined, // Stateless — no sessions
        });

        res.on('close', () => {
            transport.close().catch(() => {});
            server.close().catch(() => {});
        });

        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
    } catch (err: any) {
        logger.error({ orgId, err: err.message }, 'MCP Gateway: request error');
        if (!res.headersSent) {
            res.status(500).json({ error: 'MCP Gateway internal error' });
        }
    }
});

// ── Start Server ──────────────────────────────────────
const PORT = parseInt(process.env.MCP_GATEWAY_PORT || '3100', 10);

app.listen(PORT, '0.0.0.0', () => {
    logger.info({ port: PORT }, 'MCP Gateway started');
    logger.info(`  Health: http://0.0.0.0:${PORT}/health`);
    logger.info(`  MCP:    http://0.0.0.0:${PORT}/mcp`);
});
