import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany({
    orderBy: { position: 'asc' },
  });

  console.log('\n📊 Category Distribution:\n');

  for (const cat of categories) {
    const count = await prisma.productCategory.count({
      where: { categoryId: cat.id },
    });
    console.log(`${cat.name.padEnd(20)} (pos: ${cat.position}): ${count} products`);
  }

  await prisma.$disconnect();
}

main();
