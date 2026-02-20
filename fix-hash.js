const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
    const hash = await bcrypt.hash('admin123', 12);
    await prisma.user.update({
        where: { email: 'admin@minuevallc.com' },
        data: { passwordHash: hash }
    });
    console.log('PASSWORD_FIXED');
}
fix().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
