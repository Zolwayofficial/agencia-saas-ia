import { prisma } from './index';
import { createHash } from 'crypto';

async function seed() {
    console.log('🌱 Seeding database...\n');

    // ─── 1. Planes de Suscripción (Estilo Mailchimp) ─────────
    const plans = [
        {
            name: 'Starter',
            priceMonthly: 29,
            messagesIncluded: 1000,
            agentRunsIncluded: 5, // Básicas
            maxInstances: 1,
        },
        {
            name: 'Pro',
            priceMonthly: 79,
            messagesIncluded: 10000,
            agentRunsIncluded: 50,
            maxInstances: 3,
        },
        {
            name: 'Agency',
            priceMonthly: 199,
            messagesIncluded: -1, // Ilimitado (antes 50k)
            agentRunsIncluded: -1, // Ilimitado
            maxInstances: 10,
        },
    ];

    const createdPlans: Record<string, any> = {};

    for (const plan of plans) {
        const result = await prisma.plan.upsert({
            where: { name: plan.name },
            update: {
                priceMonthly: plan.priceMonthly,
                messagesIncluded: plan.messagesIncluded,
                agentRunsIncluded: plan.agentRunsIncluded,
                maxInstances: plan.maxInstances,
            },
            create: plan,
        });
        createdPlans[plan.name] = result;
        console.log(`  ✅ Plan "${plan.name}" — $${plan.priceMonthly}/mes, ${plan.messagesIncluded} msgs, ${plan.agentRunsIncluded === -1 ? '∞' : plan.agentRunsIncluded} agents`);
    }

    // ─── 2. Organización Admin (con plan Agency) ─────────────
    const adminOrg = await prisma.organization.upsert({
        where: { slug: 'admin' },
        update: { planId: createdPlans['Agency'].id },
        create: {
            name: 'MiNuevaLLC Admin',
            slug: 'admin',
            planId: createdPlans['Agency'].id,
        },
    });
    console.log(`\n  ✅ Org "${adminOrg.name}" → Plan Agency`);

    // ─── 3. Usuario Admin ────────────────────────────────────
    // Nota: passwordHash generado con bcryptjs para "admin123"
    // En producción, cambia esta contraseña inmediatamente.
    const defaultPasswordHash = '$2a$12$LJ3m4ys1MNqH3XGDhLbKTOvZ1.t8N/5czCQFJR.ZTvpH.H5XsH9Fi';

    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@minuevallc.com' },
        update: {},
        create: {
            email: 'admin@minuevallc.com',
            passwordHash: defaultPasswordHash,
            name: 'Admin',
            role: 'ADMIN',
            organizationId: adminOrg.id,
        },
    });
    console.log(`  ✅ User "${adminUser.email}" → role ADMIN`);

    // ─── 4. Código de Referido para Admin ────────────────────
    const referralCode = await prisma.referralCode.upsert({
        where: { organizationId: adminOrg.id },
        update: {},
        create: {
            code: 'ADMIN-REF',
            organizationId: adminOrg.id,
            level1Percent: 20,
            level2Percent: 5,
        },
    });
    console.log(`  ✅ Referral code "${referralCode.code}" → 20% L1 / 5% L2`);

    console.log('\n🎉 Seed complete!');
    console.log(`\n📋 Resumen:`);
    console.log(`   Planes:        ${Object.keys(createdPlans).length}`);
    console.log(`   Organización:  ${adminOrg.name}`);
    console.log(`   Usuario:       ${adminUser.email}`);
    console.log(`   Referido:      ${referralCode.code}`);
}

seed()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
