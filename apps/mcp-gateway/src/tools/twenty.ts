import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { logger } from '@repo/logger';

const TWENTY_SERVER_URL = process.env.TWENTY_SERVER_URL || 'http://twenty-server:3000';
const TWENTY_API_KEY = process.env.TWENTY_API_KEY || '';

async function graphql(query: string, variables?: Record<string, any>): Promise<any> {
    const res = await fetch(`${TWENTY_SERVER_URL}/api`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TWENTY_API_KEY}`,
        },
        body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
        throw new Error(`Twenty CRM API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json() as any;
    if (data.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }
    return data.data;
}

// Pre-defined schemas to avoid TS2589 deep instantiation
const createPersonSchema = {
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
};

const createOpportunitySchema = {
    name: z.string(),
    amount: z.number().optional(),
    stage: z.string().optional(),
    personId: z.string().optional(),
};

const searchPeopleSchema = {
    query: z.string(),
    limit: z.number().optional(),
};

export function registerTwentyTools(server: McpServer, orgId: string) {
    if (!TWENTY_API_KEY) {
        logger.warn({ orgId }, 'MCP Gateway: TWENTY_API_KEY not set, CRM tools disabled');
        return;
    }

    (server as any).tool(
        'crm_create_person',
        'Create a new contact/person in the CRM system',
        createPersonSchema,
        async (args: any) => {
            try {
                const result = await graphql(
                    `mutation CreatePerson($input: PersonCreateInput!) {
                        createPerson(data: $input) {
                            id
                            name { firstName lastName }
                        }
                    }`,
                    {
                        input: {
                            name: { firstName: args.firstName, lastName: args.lastName },
                            emails: args.email ? { primaryEmail: args.email } : undefined,
                            phones: args.phone ? { primaryPhone: args.phone } : undefined,
                        },
                    }
                );
                return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
            } catch (err: any) {
                logger.error({ tool: 'crm_create_person', orgId, err: err.message }, 'CRM error');
                return { content: [{ type: 'text' as const, text: `CRM error: ${err.message}` }], isError: true };
            }
        }
    );

    (server as any).tool(
        'crm_create_opportunity',
        'Create a business opportunity/deal in the CRM',
        createOpportunitySchema,
        async (args: any) => {
            try {
                const result = await graphql(
                    `mutation CreateOpportunity($input: OpportunityCreateInput!) {
                        createOpportunity(data: $input) {
                            id
                            name
                            stage
                        }
                    }`,
                    {
                        input: {
                            name: args.name,
                            amount: args.amount ? { amountMicros: args.amount * 1_000_000, currencyCode: 'USD' } : undefined,
                            stage: args.stage || 'NEW',
                            pointOfContactId: args.personId,
                        },
                    }
                );
                return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
            } catch (err: any) {
                logger.error({ tool: 'crm_create_opportunity', orgId, err: err.message }, 'CRM error');
                return { content: [{ type: 'text' as const, text: `CRM error: ${err.message}` }], isError: true };
            }
        }
    );

    (server as any).tool(
        'crm_search_people',
        'Search for people/contacts in the CRM by name or email',
        searchPeopleSchema,
        async (args: any) => {
            try {
                const result = await graphql(
                    `query FindPeople($filter: PersonFilterInput, $limit: Int) {
                        people(filter: $filter, first: $limit) {
                            edges {
                                node {
                                    id
                                    name { firstName lastName }
                                    emails { primaryEmail }
                                    phones { primaryPhone }
                                    createdAt
                                }
                            }
                        }
                    }`,
                    {
                        filter: {
                            or: [
                                { name: { firstName: { like: `%${args.query}%` } } },
                                { name: { lastName: { like: `%${args.query}%` } } },
                            ],
                        },
                        limit: args.limit || 10,
                    }
                );
                return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
            } catch (err: any) {
                logger.error({ tool: 'crm_search_people', orgId, err: err.message }, 'CRM error');
                return { content: [{ type: 'text' as const, text: `CRM error: ${err.message}` }], isError: true };
            }
        }
    );
}
