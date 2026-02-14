/**
 * Seed Script — Datos iniciales
 * Crea los planes por defecto en la base de datos.
 * IMPORTANTE: Actualizar los 'stripePriceId' con los reales de tu cuenta de Stripe.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    const plans = [
        {
            name: 'Starter',
            slug: 'starter', // Usamos slug para identificarlo
            priceMonthly: 29.00,
            messagesIncluded: 1000,
            agentRunsIncluded: 500,
            maxInstances: 1,
            stripePriceId: 'price_H5ggYJDq9g7', // ⚠️ CAMBIAR POR ID REAL DE STRIPE
        },
        {
            name: 'Pro',
            slug: 'pro',
            priceMonthly: 79.00,
            messagesIncluded: 10000,
            agentRunsIncluded: 5000,
            maxInstances: 3,
            stripePriceId: 'price_H5ggYJDq9g8', // ⚠️ CAMBIAR POR ID REAL DE STRIPE
        },
        {
            name: 'Agency',
            slug: 'agency',
            priceMonthly: 199.00,
            messagesIncluded: -1, // Ilimitado
            agentRunsIncluded: -1, // Ilimitado
            maxInstances: 10,
            stripePriceId: 'price_H5ggYJDq9g9', // ⚠️ CAMBIAR POR ID REAL DE STRIPE
        },
    ];

    for (const plan of plans) {
        await prisma.plan.upsert({
            where: { name: plan.name },
            update: {
                priceMonthly: plan.priceMonthly,
                messagesIncluded: plan.messagesIncluded,
                agentRunsIncluded: plan.agentRunsIncluded,
                maxInstances: plan.maxInstances,
                stripePriceId: plan.stripePriceId,
            },
            create: {
                name: plan.name,
                priceMonthly: plan.priceMonthly,
                messagesIncluded: plan.messagesIncluded,
                agentRunsIncluded: plan.agentRunsIncluded,
                maxInstances: plan.maxInstances,
                stripePriceId: plan.stripePriceId,
            },
        });
        console.log(`✅ Plan ${plan.name} upserted`);
    }

    console.log('🌱 Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
