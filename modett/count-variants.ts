import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const variantCount = await prisma.productVariant.count();
  const productCount = await prisma.product.count();
  const inventoryCount = await prisma.inventoryStock.count();

  console.log('Database counts:');
  console.log(`  Products: ${productCount}`);
  console.log(`  Variants: ${variantCount}`);
  console.log(`  Inventory stocks: ${inventoryCount}`);

  await prisma.$disconnect();
}

main();
