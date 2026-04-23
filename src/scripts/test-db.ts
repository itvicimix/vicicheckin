
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Attempting to connect to database...')
    const tenantCount = await prisma.tenant.count()
    console.log('Connection successful!')
    console.log('Tenant count:', tenantCount)
  } catch (error) {
    console.error('Connection failed!')
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
