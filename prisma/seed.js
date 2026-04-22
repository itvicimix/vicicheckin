const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Create a default tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'vici-checkin' },
    update: {},
    create: {
      name: 'Vici Checkin Salon',
      slug: 'vici-checkin',
      adminEmail: 'admin@vici.com',
      adminPassword: 'password123', // Remember to hash this in production
      themeColor: '#be2230',
      location: '123 Beauty St, Los Angeles, CA',
      phone: '(555) 123-4567',
      status: 'Active',
      slotInterval: 30,
      minLeadTime: 60,
      payments: JSON.stringify(['Pay in Store', 'Credit Card', 'PayPal']),
    },
  });

  console.log('Tenant created:', tenant.name);

  // 2. Create services
  const services = [
    { name: 'Manicure', price: 25, duration: 30, category: 'Nails' },
    { name: 'Pedicure', price: 35, duration: 45, category: 'Nails' },
    { name: 'Gel Polish', price: 15, duration: 20, category: 'Nails' },
    { name: 'Full Set Acrylic', price: 50, duration: 60, category: 'Nails' },
    { name: 'Facial Treatment', price: 80, duration: 60, category: 'Spa' },
    { name: 'Swedish Massage', price: 100, duration: 60, category: 'Spa' },
  ];

  for (const s of services) {
    await prisma.service.create({
      data: {
        ...s,
        tenantId: tenant.id,
      },
    });
  }
  console.log('Services created');

  // 3. Create staff
  const staff = ['Jessica', 'Michael', 'Sarah', 'David'];
  for (const name of staff) {
    await prisma.staff.create({
      data: {
        name,
        tenantId: tenant.id,
        role: 'Stylist',
      },
    });
  }
  console.log('Staff created');

  console.log('Seed finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
