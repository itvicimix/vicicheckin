const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTenants() {
  const tenants = await prisma.tenant.findMany({
    select: {
      name: true,
      createdAt: true,
      dueDate: true,
      status: true
    }
  });
  console.log(JSON.stringify(tenants, null, 2));
  await prisma.$disconnect();
}

checkTenants();
