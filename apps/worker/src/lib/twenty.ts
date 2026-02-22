import { logger } from '@repo/logger';

interface TwentyConfig {
    serverUrl: string;
    apiKey: string;
}

export class TwentyClient {
    private serverUrl: string;
    private apiKey: string;

    constructor(config: TwentyConfig) {
        this.serverUrl = config.serverUrl;
        this.apiKey = config.apiKey;
    }

    /**
     * Ejecuta una petición GraphQL contra la API de Twenty
     */
    private async requestGraphQL<T>(query: string, variables?: Record<string, any>): Promise<T> {
        const url = `${this.serverUrl}/graphql`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({ query, variables }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Twenty API error (${response.status}): ${errorText}`);
            }

            const result = await response.json() as any;

            if (result.errors) {
                throw new Error(`Twenty GraphQL Errors: ${JSON.stringify(result.errors)}`);
            }

            return result.data as T;
        } catch (error) {
            logger.error({ err: error instanceof Error ? error.message : 'Unknown error', query }, 'TwentyClient: requestGraphQL failed');
            throw error;
        }
    }

    /**
     * Crea una nueva persona (prospecto/contacto) en el CRM
     */
    async createPerson(data: { firstName: string; lastName: string; email?: string; phone?: string; whatsapp?: string }) {
        const mutation = `
      mutation CreatePerson($input: CreatePersonInput!) {
        createPerson(input: $input) {
          id
          name
        }
      }
    `;

        // Adaptar variables al esquema de Twenty (esto depende de los campos custom/estándar configurados)
        const variables = {
            input: {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phones: data.phone ? [data.phone] : [],
            }
        };

        return this.requestGraphQL(mutation, variables);
    }

    /**
     * Crea una oportunidad de negocio vinculada a una persona
     */
    async createOpportunity(data: { name: string; amount?: number; stage?: string; personId?: string }) {
        const mutation = `
      mutation CreateOpportunity($input: CreateOpportunityInput!) {
        createOpportunity(input: $input) {
          id
          name
        }
      }
    `;

        const variables = {
            input: {
                name: data.name,
                amount: { currency: "USD", amountMicros: (data.amount || 0) * 1000000 },
                stage: data.stage || "NEW",
                personId: data.personId
            }
        };

        return this.requestGraphQL(mutation, variables);
    }
}
