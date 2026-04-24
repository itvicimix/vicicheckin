import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const data: any = {};
  
  // Explicitly list model names as they appear on the prisma client
  const models = [
    'tenant', 
    'service', 
    'staff', 
    'booking', 
    'customer', 
    'systemSettings', 
    'promotionClaim', 
    'coupon'
  ];
  
  for (const model of models) {
    try {
      // @ts-ignore
      const rawData = await prisma[model].findMany();
      // Redact sensitive fields
      const redactedData = rawData.map((item: any) => {
        const newItem = { ...item };
        const sensitiveFields = ['adminPassword', 'itPassword', 'twilioSid', 'twilioAuthToken'];
        sensitiveFields.forEach(field => {
          if (newItem[field]) newItem[field] = '[REDACTED]';
        });
        return newItem;
      });
      data[model] = redactedData;
      console.log(`Exported ${data[model].length} records from ${model}`);
    } catch (e) {
      console.error(`Failed to export ${model}:`, e);
    }
  }

  const backupPath = path.join(process.cwd(), 'database_backup.json');
  fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
  console.log(`Database exported to ${backupPath}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
