import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tenants = await prisma.tenant.findMany();
  console.log(tenants.map(t => t.slug));
}

main().catch(console.error).finally(() => process.exit(0));
