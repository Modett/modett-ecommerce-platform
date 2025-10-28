import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Create warehouse location for inventory
  console.log('📦 Creating warehouse location...');
  const warehouse = await prisma.location.create({
    data: {
      type: 'warehouse',
      name: 'Main Warehouse',
      address: {
        street: '123 Warehouse District',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'US',
      },
    },
  });
  console.log(`✅ Created warehouse: ${warehouse.name}`);

  // 2. Create categories
  console.log('📁 Creating categories...');
  const investmentPiecesCategory = await prisma.category.create({
    data: {
      name: 'Investment Pieces',
      slug: 'investment-pieces',
      position: 1,
    },
  });

  const newArrivalsCategory = await prisma.category.create({
    data: {
      name: 'New Arrivals',
      slug: 'new-arrivals',
      position: 2,
    },
  });

  const collectionsCategory = await prisma.category.create({
    data: {
      name: 'Collections',
      slug: 'collections',
      position: 3,
    },
  });
  console.log(`✅ Created ${3} categories`);

  // 3. Create media assets (using Unsplash images)
  console.log('🖼️  Creating media assets...');
  const mediaAssets = await Promise.all([
    // Beige Silk Shirt
    prisma.mediaAsset.create({
      data: {
        storageKey: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca',
        mime: 'image/jpeg',
        width: 800,
        height: 1200,
        bytes: 245000,
        altText: 'Beige silk shirt - elegant and timeless',
        focalX: 50,
        focalY: 40,
        renditions: {
          thumbnail: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=150&h=200&fit=crop',
          medium: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=400&h=600&fit=crop',
          large: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=800&h=1200&fit=crop',
        },
      },
    }),
    // Beige Wide-Leg Trousers
    prisma.mediaAsset.create({
      data: {
        storageKey: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf',
        mime: 'image/jpeg',
        width: 800,
        height: 1200,
        bytes: 238000,
        altText: 'Beige wide-leg trousers - sophisticated tailoring',
        focalX: 50,
        focalY: 45,
        renditions: {
          thumbnail: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=150&h=200&fit=crop',
          medium: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=400&h=600&fit=crop',
          large: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800&h=1200&fit=crop',
        },
      },
    }),
    // Black Tailored Blazer
    prisma.mediaAsset.create({
      data: {
        storageKey: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f',
        mime: 'image/jpeg',
        width: 800,
        height: 1200,
        bytes: 252000,
        altText: 'Black tailored blazer - modern elegance',
        focalX: 50,
        focalY: 35,
        renditions: {
          thumbnail: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=150&h=200&fit=crop',
          medium: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400&h=600&fit=crop',
          large: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800&h=1200&fit=crop',
        },
      },
    }),
    // Cream Linen Dress
    prisma.mediaAsset.create({
      data: {
        storageKey: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8',
        mime: 'image/jpeg',
        width: 800,
        height: 1200,
        bytes: 241000,
        altText: 'Cream linen maxi dress - effortless style',
        focalX: 50,
        focalY: 40,
        renditions: {
          thumbnail: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=150&h=200&fit=crop',
          medium: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=600&fit=crop',
          large: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=1200&fit=crop',
        },
      },
    }),
    // Navy Relaxed Trousers
    prisma.mediaAsset.create({
      data: {
        storageKey: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1',
        mime: 'image/jpeg',
        width: 800,
        height: 1200,
        bytes: 249000,
        altText: 'Navy relaxed fit trousers - comfortable luxury',
        focalX: 50,
        focalY: 42,
        renditions: {
          thumbnail: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=150&h=200&fit=crop',
          medium: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop',
          large: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=1200&fit=crop',
        },
      },
    }),
    // Terracotta Pleated Skirt
    prisma.mediaAsset.create({
      data: {
        storageKey: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa',
        mime: 'image/jpeg',
        width: 800,
        height: 1200,
        bytes: 235000,
        altText: 'Terracotta pleated midi skirt - timeless elegance',
        focalX: 50,
        focalY: 45,
        renditions: {
          thumbnail: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=150&h=200&fit=crop',
          medium: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&h=600&fit=crop',
          large: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&h=1200&fit=crop',
        },
      },
    }),
  ]);
  console.log(`✅ Created ${mediaAssets.length} media assets`);

  // 4. Create products with variants
  console.log('👕 Creating products and variants...');

  // Product 1: Crispy Silk Shirt
  const silkShirt = await prisma.product.create({
    data: {
      title: 'Crispy Silk Shirt',
      slug: 'crispy-silk-shirt',
      brand: 'MODETT',
      shortDesc: 'Luxuriously crafted from pure mulberry silk with a crisp finish',
      longDescHtml: `
        <p>A timeless wardrobe essential, this silk shirt is crafted from the finest mulberry silk.</p>
        <ul>
          <li>100% Mulberry Silk</li>
          <li>Mother-of-pearl buttons</li>
          <li>Classic collar</li>
          <li>Relaxed fit</li>
          <li>Made in Italy</li>
        </ul>
      `,
      status: 'published',
      publishAt: new Date(),
      countryOfOrigin: 'Italy',
      seoTitle: 'Crispy Silk Shirt - Premium Mulberry Silk | MODETT',
      seoDescription: 'Invest in timeless elegance with our crispy silk shirt. Crafted from 100% mulberry silk in Italy.',
      categories: {
        create: [
          { categoryId: investmentPiecesCategory.id },
          { categoryId: newArrivalsCategory.id },
        ],
      },
      media: {
        create: [
          {
            assetId: mediaAssets[0].id,
            position: 1,
            isCover: true,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: 'MSS-SILK-SHIRT-BEIGE-XS',
            size: 'XS',
            color: 'Beige',
            price: 285.00,
            compareAtPrice: 385.00,
            weightG: 180,
            allowBackorder: false,
            allowPreorder: false,
          },
          {
            sku: 'MSS-SILK-SHIRT-BEIGE-S',
            size: 'S',
            color: 'Beige',
            price: 285.00,
            compareAtPrice: 385.00,
            weightG: 185,
            allowBackorder: false,
            allowPreorder: false,
          },
          {
            sku: 'MSS-SILK-SHIRT-BEIGE-M',
            size: 'M',
            color: 'Beige',
            price: 285.00,
            compareAtPrice: 385.00,
            weightG: 190,
            allowBackorder: false,
            allowPreorder: false,
          },
          {
            sku: 'MSS-SILK-SHIRT-BEIGE-L',
            size: 'L',
            color: 'Beige',
            price: 285.00,
            compareAtPrice: 385.00,
            weightG: 195,
            allowBackorder: false,
            allowPreorder: false,
          },
          {
            sku: 'MSS-SILK-SHIRT-WHITE-XS',
            size: 'XS',
            color: 'White',
            price: 285.00,
            compareAtPrice: 385.00,
            weightG: 180,
            allowBackorder: false,
            allowPreorder: false,
          },
          {
            sku: 'MSS-SILK-SHIRT-WHITE-S',
            size: 'S',
            color: 'White',
            price: 285.00,
            compareAtPrice: 385.00,
            weightG: 185,
            allowBackorder: false,
            allowPreorder: false,
          },
          {
            sku: 'MSS-SILK-SHIRT-WHITE-M',
            size: 'M',
            color: 'White',
            price: 285.00,
            compareAtPrice: 385.00,
            weightG: 190,
            allowBackorder: false,
            allowPreorder: false,
          },
          {
            sku: 'MSS-SILK-SHIRT-WHITE-L',
            size: 'L',
            color: 'White',
            price: 285.00,
            compareAtPrice: 385.00,
            weightG: 195,
            allowBackorder: false,
            allowPreorder: false,
          },
        ],
      },
    },
  });

  // Product 2: Wide-Leg Silk Trousers
  const wideLegTrousers = await prisma.product.create({
    data: {
      title: 'Wide-Leg Silk Trousers',
      slug: 'wide-leg-silk-trousers',
      brand: 'MODETT',
      shortDesc: 'Flowing wide-leg trousers in premium silk blend',
      longDescHtml: `
        <p>Effortlessly elegant wide-leg trousers that drape beautifully.</p>
        <ul>
          <li>90% Silk, 10% Elastane</li>
          <li>High-waisted fit</li>
          <li>Side zip closure</li>
          <li>Italian tailoring</li>
          <li>Dry clean only</li>
        </ul>
      `,
      status: 'published',
      publishAt: new Date(),
      countryOfOrigin: 'Italy',
      seoTitle: 'Wide-Leg Silk Trousers - Luxury Tailoring | MODETT',
      seoDescription: 'Flowing elegance meets impeccable tailoring in our wide-leg silk trousers.',
      categories: {
        create: [
          { categoryId: investmentPiecesCategory.id },
        ],
      },
      media: {
        create: [
          {
            assetId: mediaAssets[1].id,
            position: 1,
            isCover: true,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: 'MSS-WIDE-TROUSERS-BEIGE-XS',
            size: 'XS',
            color: 'Beige',
            price: 325.00,
            compareAtPrice: 425.00,
            weightG: 320,
            allowBackorder: false,
            allowPreorder: false,
          },
          {
            sku: 'MSS-WIDE-TROUSERS-BEIGE-S',
            size: 'S',
            color: 'Beige',
            price: 325.00,
            compareAtPrice: 425.00,
            weightG: 330,
            allowBackorder: false,
            allowPreorder: false,
          },
          {
            sku: 'MSS-WIDE-TROUSERS-BEIGE-M',
            size: 'M',
            color: 'Beige',
            price: 325.00,
            compareAtPrice: 425.00,
            weightG: 340,
            allowBackorder: false,
            allowPreorder: false,
          },
          {
            sku: 'MSS-WIDE-TROUSERS-BEIGE-L',
            size: 'L',
            color: 'Beige',
            price: 325.00,
            compareAtPrice: 425.00,
            weightG: 350,
            allowBackorder: false,
            allowPreorder: false,
          },
        ],
      },
    },
  });

  // Product 3: Tailored Blazer
  const tailoredBlazer = await prisma.product.create({
    data: {
      title: 'Tailored Wool Blazer',
      slug: 'tailored-wool-blazer',
      brand: 'MODETT',
      shortDesc: 'Sharp tailoring in premium Italian wool',
      longDescHtml: `
        <p>A perfectly tailored blazer that defines modern sophistication.</p>
        <ul>
          <li>100% Virgin Wool</li>
          <li>Structured shoulders</li>
          <li>Single-breasted</li>
          <li>Notch lapels</li>
          <li>Made in Italy</li>
        </ul>
      `,
      status: 'published',
      publishAt: new Date(),
      countryOfOrigin: 'Italy',
      seoTitle: 'Tailored Wool Blazer - Italian Craftsmanship | MODETT',
      seoDescription: 'Impeccable tailoring in 100% virgin wool. A wardrobe investment piece.',
      categories: {
        create: [
          { categoryId: investmentPiecesCategory.id },
        ],
      },
      media: {
        create: [
          {
            assetId: mediaAssets[2].id,
            position: 1,
            isCover: true,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: 'MSS-BLAZER-BLACK-XS',
            size: 'XS',
            color: 'Black',
            price: 485.00,
            compareAtPrice: 685.00,
            weightG: 580,
            allowBackorder: false,
            allowPreorder: false,
          },
          {
            sku: 'MSS-BLAZER-BLACK-S',
            size: 'S',
            color: 'Black',
            price: 485.00,
            compareAtPrice: 685.00,
            weightG: 595,
            allowBackorder: false,
            allowPreorder: false,
          },
          {
            sku: 'MSS-BLAZER-BLACK-M',
            size: 'M',
            color: 'Black',
            price: 485.00,
            compareAtPrice: 685.00,
            weightG: 610,
            allowBackorder: false,
            allowPreorder: false,
          },
          {
            sku: 'MSS-BLAZER-BLACK-L',
            size: 'L',
            color: 'Black',
            price: 485.00,
            compareAtPrice: 685.00,
            weightG: 625,
            allowBackorder: false,
            allowPreorder: false,
          },
          {
            sku: 'MSS-BLAZER-NAVY-XS',
            size: 'XS',
            color: 'Navy',
            price: 485.00,
            compareAtPrice: 685.00,
            weightG: 580,
            allowBackorder: false,
            allowPreorder: false,
          },
          {
            sku: 'MSS-BLAZER-NAVY-S',
            size: 'S',
            color: 'Navy',
            price: 485.00,
            compareAtPrice: 685.00,
            weightG: 595,
            allowBackorder: false,
            allowPreorder: false,
          },
          {
            sku: 'MSS-BLAZER-NAVY-M',
            size: 'M',
            color: 'Navy',
            price: 485.00,
            compareAtPrice: 685.00,
            weightG: 610,
            allowBackorder: false,
            allowPreorder: false,
          },
          {
            sku: 'MSS-BLAZER-NAVY-L',
            size: 'L',
            color: 'Navy',
            price: 485.00,
            compareAtPrice: 685.00,
            weightG: 625,
            allowBackorder: false,
            allowPreorder: false,
          },
        ],
      },
    },
  });

  // Product 4: Linen Maxi Dress
  const linenDress = await prisma.product.create({
    data: {
      title: 'Linen Maxi Dress',
      slug: 'linen-maxi-dress',
      brand: 'MODETT',
      shortDesc: 'Flowing maxi dress in breathable European linen',
      longDescHtml: `
        <p>Timeless elegance in premium European linen.</p>
        <ul>
          <li>100% European Linen</li>
          <li>Relaxed fit</li>
          <li>V-neckline</li>
          <li>Side pockets</li>
          <li>Machine washable</li>
        </ul>
      `,
      status: 'published',
      publishAt: new Date(),
      countryOfOrigin: 'Portugal',
      seoTitle: 'Linen Maxi Dress - Sustainable Luxury | MODETT',
      seoDescription: 'Breathable elegance in 100% European linen. Perfect for any season.',
      categories: {
        create: [
          { categoryId: investmentPiecesCategory.id },
        ],
      },
      media: {
        create: [
          {
            assetId: mediaAssets[3].id,
            position: 1,
            isCover: true,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: 'MSS-LINEN-DRESS-CREAM-XS',
            size: 'XS',
            color: 'Cream',
            price: 245.00,
            compareAtPrice: 345.00,
            weightG: 380,
            allowBackorder: false,
            allowPreorder: false,
          },
          {
            sku: 'MSS-LINEN-DRESS-CREAM-S',
            size: 'S',
            color: 'Cream',
            price: 245.00,
            compareAtPrice: 345.00,
            weightG: 390,
            allowBackorder: false,
            allowPreorder: false,
          },
          {
            sku: 'MSS-LINEN-DRESS-CREAM-M',
            size: 'M',
            color: 'Cream',
            price: 245.00,
            compareAtPrice: 345.00,
            weightG: 400,
            allowBackorder: false,
            allowPreorder: false,
          },
          {
            sku: 'MSS-LINEN-DRESS-CREAM-L',
            size: 'L',
            color: 'Cream',
            price: 245.00,
            compareAtPrice: 345.00,
            weightG: 410,
            allowBackorder: false,
            allowPreorder: false,
          },
        ],
      },
    },
  });

  // Product 5: Relaxed Linen Trousers
  const relaxedTrousers = await prisma.product.create({
    data: {
      title: 'Relaxed Linen Trousers',
      slug: 'relaxed-linen-trousers',
      brand: 'MODETT',
      shortDesc: 'Comfortable yet refined in premium linen',
      longDescHtml: `
        <p>The perfect blend of comfort and elegance.</p>
        <ul>
          <li>100% European Linen</li>
          <li>Relaxed fit</li>
          <li>Elastic waistband</li>
          <li>Side pockets</li>
          <li>Machine washable</li>
        </ul>
      `,
      status: 'published',
      publishAt: new Date(),
      countryOfOrigin: 'Portugal',
      seoTitle: 'Relaxed Linen Trousers - Effortless Style | MODETT',
      seoDescription: 'Comfort meets sophistication in our relaxed linen trousers.',
      categories: {
        create: [
          { categoryId: investmentPiecesCategory.id },
        ],
      },
      media: {
        create: [
          {
            assetId: mediaAssets[4].id,
            position: 1,
            isCover: true,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: 'MSS-RELAXED-TROUSERS-NAVY-XS',
            size: 'XS',
            color: 'Navy',
            price: 195.00,
            compareAtPrice: 285.00,
            weightG: 350,
            allowBackorder: false,
            allowPreorder: false,
          },
          {
            sku: 'MSS-RELAXED-TROUSERS-NAVY-S',
            size: 'S',
            color: 'Navy',
            price: 195.00,
            compareAtPrice: 285.00,
            weightG: 360,
            allowBackorder: false,
            allowPreorder: false,
          },
          {
            sku: 'MSS-RELAXED-TROUSERS-NAVY-M',
            size: 'M',
            color: 'Navy',
            price: 195.00,
            compareAtPrice: 285.00,
            weightG: 370,
            allowBackorder: false,
            allowPreorder: false,
          },
          {
            sku: 'MSS-RELAXED-TROUSERS-NAVY-L',
            size: 'L',
            color: 'Navy',
            price: 195.00,
            compareAtPrice: 285.00,
            weightG: 380,
            allowBackorder: false,
            allowPreorder: false,
          },
        ],
      },
    },
  });

  // Product 6: Pleated Midi Skirt
  const pleatedSkirt = await prisma.product.create({
    data: {
      title: 'Pleated Midi Skirt',
      slug: 'pleated-midi-skirt',
      brand: 'MODETT',
      shortDesc: 'Elegant pleated skirt with timeless appeal',
      longDescHtml: `
        <p>A versatile piece that transitions seamlessly from day to evening.</p>
        <ul>
          <li>100% Viscose</li>
          <li>Accordion pleats</li>
          <li>Elastic waistband</li>
          <li>Midi length</li>
          <li>Dry clean recommended</li>
        </ul>
      `,
      status: 'published',
      publishAt: new Date(),
      countryOfOrigin: 'France',
      seoTitle: 'Pleated Midi Skirt - Timeless Elegance | MODETT',
      seoDescription: 'Beautifully pleated midi skirt that moves with you.',
      categories: {
        create: [
          { categoryId: investmentPiecesCategory.id },
        ],
      },
      media: {
        create: [
          {
            assetId: mediaAssets[5].id,
            position: 1,
            isCover: true,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: 'MSS-PLEATED-SKIRT-TERRACOTTA-XS',
            size: 'XS',
            color: 'Terracotta',
            price: 215.00,
            compareAtPrice: 315.00,
            weightG: 280,
            allowBackorder: false,
            allowPreorder: false,
          },
          {
            sku: 'MSS-PLEATED-SKIRT-TERRACOTTA-S',
            size: 'S',
            color: 'Terracotta',
            price: 215.00,
            compareAtPrice: 315.00,
            weightG: 290,
            allowBackorder: false,
            allowPreorder: false,
          },
          {
            sku: 'MSS-PLEATED-SKIRT-TERRACOTTA-M',
            size: 'M',
            color: 'Terracotta',
            price: 215.00,
            compareAtPrice: 315.00,
            weightG: 300,
            allowBackorder: false,
            allowPreorder: false,
          },
          {
            sku: 'MSS-PLEATED-SKIRT-TERRACOTTA-L',
            size: 'L',
            color: 'Terracotta',
            price: 215.00,
            compareAtPrice: 315.00,
            weightG: 310,
            allowBackorder: false,
            allowPreorder: false,
          },
          {
            sku: 'MSS-PLEATED-SKIRT-BLACK-XS',
            size: 'XS',
            color: 'Black',
            price: 215.00,
            compareAtPrice: 315.00,
            weightG: 280,
            allowBackorder: false,
            allowPreorder: false,
          },
          {
            sku: 'MSS-PLEATED-SKIRT-BLACK-S',
            size: 'S',
            color: 'Black',
            price: 215.00,
            compareAtPrice: 315.00,
            weightG: 290,
            allowBackorder: false,
            allowPreorder: false,
          },
          {
            sku: 'MSS-PLEATED-SKIRT-BLACK-M',
            size: 'M',
            color: 'Black',
            price: 215.00,
            compareAtPrice: 315.00,
            weightG: 300,
            allowBackorder: false,
            allowPreorder: false,
          },
          {
            sku: 'MSS-PLEATED-SKIRT-BLACK-L',
            size: 'L',
            color: 'Black',
            price: 215.00,
            compareAtPrice: 315.00,
            weightG: 310,
            allowBackorder: false,
            allowPreorder: false,
          },
        ],
      },
    },
  });

  console.log(`✅ Created 6 products with variants`);

  // 5. Create inventory stock for all variants
  console.log('📊 Creating inventory stock...');

  // Get all variants
  const allVariants = await prisma.productVariant.findMany();

  // Create inventory stock for each variant
  const inventoryPromises = allVariants.map((variant) => {
    // Randomize stock levels for realism
    const stockLevel = Math.floor(Math.random() * 30) + 10; // 10-40 units

    return prisma.inventoryStock.create({
      data: {
        variantId: variant.id,
        locationId: warehouse.id,
        onHand: stockLevel,
        reserved: 0,
        lowStockThreshold: 5,
        safetyStock: 10,
      },
    });
  });

  await Promise.all(inventoryPromises);
  console.log(`✅ Created inventory stock for ${allVariants.length} variants`);

  // Summary
  console.log('\n📊 Seed Summary:');
  console.log(`   Locations: 1 warehouse`);
  console.log(`   Categories: 3`);
  console.log(`   Media Assets: ${mediaAssets.length}`);
  console.log(`   Products: 6`);
  console.log(`   Variants: ${allVariants.length}`);
  console.log(`   Inventory Records: ${allVariants.length}`);
  console.log('\n✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
