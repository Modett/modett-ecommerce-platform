import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLocations() {
  try {
    const locations = await prisma.location.findMany();
    console.log('Locations in database:');
    console.log(JSON.stringify(locations, null, 2));

    const stocks = await (prisma as any).inventoryStock.findMany({
      take: 5
    });
    console.log('\nSample inventory stocks:');
    console.log(JSON.stringify(stocks, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLocations();
