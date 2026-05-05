const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateData() {
  console.log("Starting data migration...");
  const tenantsWithNullDue = await prisma.tenant.findMany({
    where: { dueDate: null }
  });
  
  console.log(`Found ${tenantsWithNullDue.length} tenants with null dueDate.`);
  
  for (const t of tenantsWithNullDue) {
    const newDue = new Date(t.createdAt);
    newDue.setFullYear(newDue.getFullYear() + 1);
    console.log(`Updating ${t.name}: Created at ${t.createdAt}, setting due date to ${newDue}`);
    await prisma.tenant.update({
      where: { id: t.id },
      data: { dueDate: newDue }
    });
  }
  
  console.log("Migration complete.");
  await prisma.$disconnect();
}

migrateData().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
