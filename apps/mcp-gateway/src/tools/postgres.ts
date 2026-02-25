import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { Pool } from 'pg';
import { logger } from '@repo/logger';

const readPool = new Pool({
    connectionString: process.env.DATABASE_READONLY_URL,
    max: 10,
    idleTimeoutMillis: 30000,
});

const FORBIDDEN_KEYWORDS = [
    'DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'TRUNCATE',
    'CREATE', 'GRANT', 'REVOKE', 'EXECUTE', 'COPY', 'VACUUM',
];

const querySchema = { query: z.string() };
const emptySchema = {};
const tableNameSchema = { table_name: z.string() };

export function registerPostgresTools(server: McpServer, orgId: string) {
    (server as any).tool(
        'query_database',
        'Execute a read-only SQL SELECT query on the database. Only SELECT statements are allowed.',
        querySchema,
        async ({ query }: any) => {
            const normalized = query.trim().toUpperCase();

            if (!normalized.startsWith('SELECT') && !normalized.startsWith('WITH')) {
                return {
                    content: [{ type: 'text' as const, text: 'Error: Only SELECT/WITH queries are allowed' }],
                    isError: true,
                };
            }

            if (FORBIDDEN_KEYWORDS.some(kw => normalized.includes(kw + ' ') || normalized.includes(kw + '('))) {
                return {
                    content: [{ type: 'text' as const, text: 'Error: Query contains forbidden keywords' }],
                    isError: true,
                };
            }

            try {
                const result = await readPool.query(query);
                const rows = result.rows.slice(0, 100); // Limit to 100 rows
                const truncated = result.rows.length > 100;

                return {
                    content: [{
                        type: 'text' as const,
                        text: JSON.stringify({
                            rows,
                            rowCount: result.rowCount,
                            truncated,
                        }, null, 2),
                    }],
                };
            } catch (err: any) {
                logger.error({ tool: 'query_database', orgId, err: err.message }, 'MCP query error');
                return {
                    content: [{ type: 'text' as const, text: `Query error: ${err.message}` }],
                    isError: true,
                };
            }
        }
    );

    (server as any).tool(
        'list_tables',
        'List all available database tables in the public schema',
        emptySchema,
        async () => {
            try {
                const result = await readPool.query(
                    `SELECT table_name, pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as size
                     FROM information_schema.tables
                     WHERE table_schema = 'public'
                     ORDER BY table_name`
                );
                return {
                    content: [{ type: 'text' as const, text: JSON.stringify(result.rows, null, 2) }],
                };
            } catch (err: any) {
                return {
                    content: [{ type: 'text' as const, text: `Error: ${err.message}` }],
                    isError: true,
                };
            }
        }
    );

    (server as any).tool(
        'describe_table',
        'Get the schema (columns, types, constraints) of a specific database table',
        tableNameSchema,
        async ({ table_name }: any) => {
            const safeName = table_name.replace(/[^a-zA-Z0-9_]/g, '');
            try {
                const result = await readPool.query(
                    `SELECT column_name, data_type, is_nullable, column_default
                     FROM information_schema.columns
                     WHERE table_name = $1 AND table_schema = 'public'
                     ORDER BY ordinal_position`,
                    [safeName]
                );
                return {
                    content: [{ type: 'text' as const, text: JSON.stringify(result.rows, null, 2) }],
                };
            } catch (err: any) {
                return {
                    content: [{ type: 'text' as const, text: `Error: ${err.message}` }],
                    isError: true,
                };
            }
        }
    );
}
