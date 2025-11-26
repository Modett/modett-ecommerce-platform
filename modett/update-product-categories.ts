import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapping of product titles to their categories
const productCategoryMapping = {
  // Outerwear
  'Oversized Linen Blazer': 'Outerwear',
  'Double-Breasted Coat': 'Outerwear',
  'Alpaca Blend Cardigan': 'Outerwear',
  'Belted Trench Coat': 'Outerwear',
  'Structured Leather Jacket': 'Outerwear',
  'Cropped Blazer': 'Outerwear',

  // Bottoms
  'Cropped Wide-Leg Pants': 'Bottoms',
  'A-Line Midi Skirt': 'Bottoms',
  'Tailored Culottes': 'Bottoms',
  'High-Waisted Jeans': 'Bottoms',
  'Tiered Maxi Skirt': 'Bottoms',
  'Asymmetric Hem Skirt': 'Bottoms',
  'Straight Leg Pants': 'Bottoms',
  'Pencil Skirt': 'Bottoms',
  'Relaxed Linen Pants': 'Bottoms',
  'Accordion Pleat Skirt': 'Bottoms',
  'Paper Bag Waist Pants': 'Bottoms',

  // Dresses
  'Wrap Midi Dress': 'Dresses',
  'Ribbed Knit Dress': 'Dresses',
  'Shirt Dress': 'Dresses',

  // Tops
  'Satin Camisole': 'Tops',
  'Oversized Cotton Shirt': 'Tops',
  'Cable Knit Sweater': 'Tops',
  'Draped Blouse': 'Tops',
  'Mandarin Collar Shirt': 'Tops',
  'Mock Neck Sweater': 'Tops',
  'Mohair Blend Sweater': 'Tops',
  'Halter Neck Top': 'Tops',
  'Henley Top': 'Tops',
  'V-Neck Knit Vest': 'Tops',
};

async function main() {
  console.log('🔄 Updating product categories...\n');

  // Get all category IDs
  const tops = await prisma.category.findUnique({ where: { slug: 'tops' } });
  const bottoms = await prisma.category.findUnique({ where: { slug: 'bottoms' } });
  const dresses = await prisma.category.findUnique({ where: { slug: 'dresses' } });
  const outerwear = await prisma.category.findUnique({ where: { slug: 'outerwear' } });

  if (!tops || !bottoms || !dresses || !outerwear) {
    throw new Error('Product type categories not found');
  }

  const categoryMap = {
    'Tops': tops.id,
    'Bottoms': bottoms.id,
    'Dresses': dresses.id,
    'Outerwear': outerwear.id,
  };

  let updatedCount = 0;

  // Update each product
  for (const [productTitle, categoryType] of Object.entries(productCategoryMapping)) {
    const product = await prisma.product.findFirst({
      where: { title: productTitle },
      include: { categories: true },
    });

    if (!product) {
      console.log(`❌ Product not found: ${productTitle}`);
      continue;
    }

    const categoryId = categoryMap[categoryType as keyof typeof categoryMap];

    // Check if product already has this category
    const hasCategory = product.categories.some(pc => pc.categoryId === categoryId);

    if (!hasCategory) {
      // Add the category to the product
      await prisma.productCategory.create({
        data: {
          productId: product.id,
          categoryId: categoryId,
        },
      });

      console.log(`✅ Updated: ${productTitle} → ${categoryType}`);
      updatedCount++;
    } else {
      console.log(`⏭️  Already has category: ${productTitle} → ${categoryType}`);
    }
  }

  console.log(`\n✨ Updated ${updatedCount} products`);
  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
