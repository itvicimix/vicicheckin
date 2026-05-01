const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }).then(n => {
  console.log(n);
  return prisma.$disconnect();
}).catch(console.error);
