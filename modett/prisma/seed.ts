import { PrismaClient, Prisma } from '@prisma/client';

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
  console.log(`✅ Created 3 categories`);

  // 3. Create media assets (using high-quality Unsplash images)
  console.log('🖼️  Creating media assets...');
  const mediaAssets = await Promise.all([
    // 1. Beige Silk Shirt
    prisma.mediaAsset.create({
      data: {
        storageKey: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca',
        mime: 'image/jpeg',
        width: 1200,
        height: 1600,
        bytes: 345000,
        altText: 'Beige silk shirt - elegant minimalist fashion',
        focalX: 600,
        focalY: 800,
        renditions: {
          thumbnail: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=200&h=300&fit=crop',
          medium: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=600&h=800&fit=crop',
          large: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=1200&h=1600&fit=crop',
        },
      },
    }),
    // 2. Wide-Leg Trousers
    prisma.mediaAsset.create({
      data: {
        storageKey: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf',
        mime: 'image/jpeg',
        width: 1200,
        height: 1600,
        bytes: 338000,
        altText: 'Wide-leg trousers - luxury tailoring',
        focalX: 600,
        focalY: 900,
        renditions: {
          thumbnail: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=200&h=300&fit=crop',
          medium: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=600&h=800&fit=crop',
          large: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=1200&h=1600&fit=crop',
        },
      },
    }),
    // 3. Tailored Blazer
    prisma.mediaAsset.create({
      data: {
        storageKey: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f',
        mime: 'image/jpeg',
        width: 1200,
        height: 1600,
        bytes: 352000,
        altText: 'Tailored blazer - modern sophistication',
        focalX: 600,
        focalY: 700,
        renditions: {
          thumbnail: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=200&h=300&fit=crop',
          medium: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=600&h=800&fit=crop',
          large: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=1200&h=1600&fit=crop',
        },
      },
    }),
    // 4. Linen Maxi Dress
    prisma.mediaAsset.create({
      data: {
        storageKey: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8',
        mime: 'image/jpeg',
        width: 1200,
        height: 1600,
        bytes: 341000,
        altText: 'Linen maxi dress - effortless elegance',
        focalX: 600,
        focalY: 800,
        renditions: {
          thumbnail: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&h=300&fit=crop',
          medium: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop',
          large: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200&h=1600&fit=crop',
        },
      },
    }),
    // 5. Cashmere Sweater
    prisma.mediaAsset.create({
      data: {
        storageKey: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105',
        mime: 'image/jpeg',
        width: 1200,
        height: 1600,
        bytes: 328000,
        altText: 'Cashmere crewneck sweater - luxury knitwear',
        focalX: 600,
        focalY: 750,
        renditions: {
          thumbnail: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200&h=300&fit=crop',
          medium: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=800&fit=crop',
          large: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=1200&h=1600&fit=crop',
        },
      },
    }),
    // 6. Pleated Midi Skirt
    prisma.mediaAsset.create({
      data: {
        storageKey: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa',
        mime: 'image/jpeg',
        width: 1200,
        height: 1600,
        bytes: 335000,
        altText: 'Pleated midi skirt - timeless design',
        focalX: 600,
        focalY: 900,
        renditions: {
          thumbnail: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=200&h=300&fit=crop',
          medium: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&h=800&fit=crop',
          large: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=1200&h=1600&fit=crop',
        },
      },
    }),
    // 7. Silk Slip Dress
    prisma.mediaAsset.create({
      data: {
        storageKey: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae',
        mime: 'image/jpeg',
        width: 1200,
        height: 1600,
        bytes: 318000,
        altText: 'Silk slip dress - refined minimalism',
        focalX: 600,
        focalY: 800,
        renditions: {
          thumbnail: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=200&h=300&fit=crop',
          medium: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&h=800&fit=crop',
          large: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=1200&h=1600&fit=crop',
        },
      },
    }),
    // 8. Wool Wide-Leg Trousers
    prisma.mediaAsset.create({
      data: {
        storageKey: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1',
        mime: 'image/jpeg',
        width: 1200,
        height: 1600,
        bytes: 349000,
        altText: 'Wool wide-leg trousers - contemporary style',
        focalX: 600,
        focalY: 850,
        renditions: {
          thumbnail: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200&h=300&fit=crop',
          medium: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=800&fit=crop',
          large: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=1200&h=1600&fit=crop',
        },
      },
    }),
    // 9. Cotton Poplin Shirt
    prisma.mediaAsset.create({
      data: {
        storageKey: 'https://images.unsplash.com/photo-1618886614638-80e3c103d31a',
        mime: 'image/jpeg',
        width: 1200,
        height: 1600,
        bytes: 325000,
        altText: 'Cotton poplin shirt - classic wardrobe staple',
        focalX: 600,
        focalY: 750,
        renditions: {
          thumbnail: 'https://images.unsplash.com/photo-1618886614638-80e3c103d31a?w=200&h=300&fit=crop',
          medium: 'https://images.unsplash.com/photo-1618886614638-80e3c103d31a?w=600&h=800&fit=crop',
          large: 'https://images.unsplash.com/photo-1618886614638-80e3c103d31a?w=1200&h=1600&fit=crop',
        },
      },
    }),
    // 10. Merino Wool Turtleneck
    prisma.mediaAsset.create({
      data: {
        storageKey: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633',
        mime: 'image/jpeg',
        width: 1200,
        height: 1600,
        bytes: 332000,
        altText: 'Merino wool turtleneck - winter essential',
        focalX: 600,
        focalY: 700,
        renditions: {
          thumbnail: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=200&h=300&fit=crop',
          medium: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=800&fit=crop',
          large: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1200&h=1600&fit=crop',
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
        <p>A timeless wardrobe essential, this silk shirt is crafted from the finest mulberry silk sourced from Italian silk houses.</p>
        <h3>Features</h3>
        <ul>
          <li>100% Mulberry Silk</li>
          <li>Mother-of-pearl buttons</li>
          <li>Classic collar with structured placket</li>
          <li>Relaxed fit with elegant drape</li>
          <li>Made in Italy</li>
        </ul>
        <h3>Care Instructions</h3>
        <p>Dry clean only. Store on padded hanger.</p>
      `,
      status: 'published',
      publishAt: new Date(),
      countryOfOrigin: 'Italy',
      seoTitle: 'Crispy Silk Shirt - Premium Mulberry Silk | MODETT',
      seoDescription: 'Invest in timeless elegance with our crispy silk shirt. Crafted from 100% mulberry silk in Italy for the discerning modern woman.',
      categories: {
        create: [
          { categoryId: investmentPiecesCategory.id },
          { categoryId: newArrivalsCategory.id },
        ],
      },
      media: {
        create: [
          { assetId: mediaAssets[0].id, position: 1, isCover: true },
        ],
      },
      variants: {
        create: [
          { sku: 'MOD-SILK-SHIRT-BEIGE-XS', size: 'XS', color: 'Beige', price: new Prisma.Decimal('285.00'), compareAtPrice: new Prisma.Decimal('385.00'), weightG: 180 },
          { sku: 'MOD-SILK-SHIRT-BEIGE-S', size: 'S', color: 'Beige', price: new Prisma.Decimal('285.00'), compareAtPrice: new Prisma.Decimal('385.00'), weightG: 185 },
          { sku: 'MOD-SILK-SHIRT-BEIGE-M', size: 'M', color: 'Beige', price: new Prisma.Decimal('285.00'), compareAtPrice: new Prisma.Decimal('385.00'), weightG: 190 },
          { sku: 'MOD-SILK-SHIRT-BEIGE-L', size: 'L', color: 'Beige', price: new Prisma.Decimal('285.00'), compareAtPrice: new Prisma.Decimal('385.00'), weightG: 195 },
          { sku: 'MOD-SILK-SHIRT-WHITE-XS', size: 'XS', color: 'White', price: new Prisma.Decimal('285.00'), compareAtPrice: new Prisma.Decimal('385.00'), weightG: 180 },
          { sku: 'MOD-SILK-SHIRT-WHITE-S', size: 'S', color: 'White', price: new Prisma.Decimal('285.00'), compareAtPrice: new Prisma.Decimal('385.00'), weightG: 185 },
          { sku: 'MOD-SILK-SHIRT-WHITE-M', size: 'M', color: 'White', price: new Prisma.Decimal('285.00'), compareAtPrice: new Prisma.Decimal('385.00'), weightG: 190 },
          { sku: 'MOD-SILK-SHIRT-WHITE-L', size: 'L', color: 'White', price: new Prisma.Decimal('285.00'), compareAtPrice: new Prisma.Decimal('385.00'), weightG: 195 },
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
        <p>Effortlessly elegant wide-leg trousers that drape beautifully and move with you.</p>
        <h3>Features</h3>
        <ul>
          <li>90% Silk, 10% Elastane for comfort</li>
          <li>High-waisted fit with invisible zip</li>
          <li>Side pockets</li>
          <li>Italian tailoring with precise seam work</li>
          <li>Fully lined</li>
        </ul>
        <h3>Styling</h3>
        <p>Pair with our Crispy Silk Shirt for a complete luxe look, or style with knitwear for effortless elegance.</p>
      `,
      status: 'published',
      publishAt: new Date(),
      countryOfOrigin: 'Italy',
      seoTitle: 'Wide-Leg Silk Trousers - Luxury Tailoring | MODETT',
      seoDescription: 'Flowing elegance meets impeccable Italian tailoring in our wide-leg silk trousers.',
      categories: {
        create: [
          { categoryId: investmentPiecesCategory.id },
        ],
      },
      media: {
        create: [
          { assetId: mediaAssets[1].id, position: 1, isCover: true },
        ],
      },
      variants: {
        create: [
          { sku: 'MOD-WIDE-TROUSERS-BEIGE-XS', size: 'XS', color: 'Beige', price: new Prisma.Decimal('325.00'), compareAtPrice: new Prisma.Decimal('425.00'), weightG: 320 },
          { sku: 'MOD-WIDE-TROUSERS-BEIGE-S', size: 'S', color: 'Beige', price: new Prisma.Decimal('325.00'), compareAtPrice: new Prisma.Decimal('425.00'), weightG: 330 },
          { sku: 'MOD-WIDE-TROUSERS-BEIGE-M', size: 'M', color: 'Beige', price: new Prisma.Decimal('325.00'), compareAtPrice: new Prisma.Decimal('425.00'), weightG: 340 },
          { sku: 'MOD-WIDE-TROUSERS-BEIGE-L', size: 'L', color: 'Beige', price: new Prisma.Decimal('325.00'), compareAtPrice: new Prisma.Decimal('425.00'), weightG: 350 },
          { sku: 'MOD-WIDE-TROUSERS-NAVY-XS', size: 'XS', color: 'Navy', price: new Prisma.Decimal('325.00'), compareAtPrice: new Prisma.Decimal('425.00'), weightG: 320 },
          { sku: 'MOD-WIDE-TROUSERS-NAVY-S', size: 'S', color: 'Navy', price: new Prisma.Decimal('325.00'), compareAtPrice: new Prisma.Decimal('425.00'), weightG: 330 },
          { sku: 'MOD-WIDE-TROUSERS-NAVY-M', size: 'M', color: 'Navy', price: new Prisma.Decimal('325.00'), compareAtPrice: new Prisma.Decimal('425.00'), weightG: 340 },
          { sku: 'MOD-WIDE-TROUSERS-NAVY-L', size: 'L', color: 'Navy', price: new Prisma.Decimal('325.00'), compareAtPrice: new Prisma.Decimal('425.00'), weightG: 350 },
        ],
      },
    },
  });

  // Product 3: Tailored Wool Blazer
  const tailoredBlazer = await prisma.product.create({
    data: {
      title: 'Tailored Wool Blazer',
      slug: 'tailored-wool-blazer',
      brand: 'MODETT',
      shortDesc: 'Sharp tailoring in premium Italian virgin wool',
      longDescHtml: `
        <p>A perfectly tailored blazer that defines modern sophistication and will serve you for years to come.</p>
        <h3>Features</h3>
        <ul>
          <li>100% Virgin Wool from Italian mills</li>
          <li>Structured shoulders with natural padding</li>
          <li>Single-breasted with notch lapels</li>
          <li>Interior pockets and ticket pocket</li>
          <li>Horn buttons</li>
          <li>Made in Italy by master tailors</li>
        </ul>
        <h3>Fit</h3>
        <p>Tailored fit with defined waist. Designed to layer over shirts and knitwear.</p>
      `,
      status: 'published',
      publishAt: new Date(),
      countryOfOrigin: 'Italy',
      seoTitle: 'Tailored Wool Blazer - Italian Craftsmanship | MODETT',
      seoDescription: 'Impeccable Italian tailoring in 100% virgin wool. A true investment piece for the modern wardrobe.',
      categories: {
        create: [
          { categoryId: investmentPiecesCategory.id },
        ],
      },
      media: {
        create: [
          { assetId: mediaAssets[2].id, position: 1, isCover: true },
        ],
      },
      variants: {
        create: [
          { sku: 'MOD-BLAZER-BLACK-XS', size: 'XS', color: 'Black', price: new Prisma.Decimal('485.00'), compareAtPrice: new Prisma.Decimal('685.00'), weightG: 580 },
          { sku: 'MOD-BLAZER-BLACK-S', size: 'S', color: 'Black', price: new Prisma.Decimal('485.00'), compareAtPrice: new Prisma.Decimal('685.00'), weightG: 595 },
          { sku: 'MOD-BLAZER-BLACK-M', size: 'M', color: 'Black', price: new Prisma.Decimal('485.00'), compareAtPrice: new Prisma.Decimal('685.00'), weightG: 610 },
          { sku: 'MOD-BLAZER-BLACK-L', size: 'L', color: 'Black', price: new Prisma.Decimal('485.00'), compareAtPrice: new Prisma.Decimal('685.00'), weightG: 625 },
          { sku: 'MOD-BLAZER-NAVY-XS', size: 'XS', color: 'Navy', price: new Prisma.Decimal('485.00'), compareAtPrice: new Prisma.Decimal('685.00'), weightG: 580 },
          { sku: 'MOD-BLAZER-NAVY-S', size: 'S', color: 'Navy', price: new Prisma.Decimal('485.00'), compareAtPrice: new Prisma.Decimal('685.00'), weightG: 595 },
          { sku: 'MOD-BLAZER-NAVY-M', size: 'M', color: 'Navy', price: new Prisma.Decimal('485.00'), compareAtPrice: new Prisma.Decimal('685.00'), weightG: 610 },
          { sku: 'MOD-BLAZER-NAVY-L', size: 'L', color: 'Navy', price: new Prisma.Decimal('485.00'), compareAtPrice: new Prisma.Decimal('685.00'), weightG: 625 },
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
        <p>Timeless elegance in premium European linen. This maxi dress embodies effortless summer sophistication.</p>
        <h3>Features</h3>
        <ul>
          <li>100% European Linen</li>
          <li>Relaxed fit with elegant drape</li>
          <li>V-neckline with delicate ties</li>
          <li>Deep side pockets</li>
          <li>Maxi length</li>
          <li>Machine washable</li>
        </ul>
        <h3>Sustainability</h3>
        <p>Made from flax grown in France and woven in Portugal, this dress represents our commitment to sustainable luxury.</p>
      `,
      status: 'published',
      publishAt: new Date(),
      countryOfOrigin: 'Portugal',
      seoTitle: 'Linen Maxi Dress - Sustainable Luxury | MODETT',
      seoDescription: 'Breathable elegance in 100% European linen. Perfect for any season.',
      categories: {
        create: [
          { categoryId: investmentPiecesCategory.id },
          { categoryId: collectionsCategory.id },
        ],
      },
      media: {
        create: [
          { assetId: mediaAssets[3].id, position: 1, isCover: true },
        ],
      },
      variants: {
        create: [
          { sku: 'MOD-LINEN-DRESS-CREAM-XS', size: 'XS', color: 'Cream', price: new Prisma.Decimal('245.00'), compareAtPrice: new Prisma.Decimal('345.00'), weightG: 380 },
          { sku: 'MOD-LINEN-DRESS-CREAM-S', size: 'S', color: 'Cream', price: new Prisma.Decimal('245.00'), compareAtPrice: new Prisma.Decimal('345.00'), weightG: 390 },
          { sku: 'MOD-LINEN-DRESS-CREAM-M', size: 'M', color: 'Cream', price: new Prisma.Decimal('245.00'), compareAtPrice: new Prisma.Decimal('345.00'), weightG: 400 },
          { sku: 'MOD-LINEN-DRESS-CREAM-L', size: 'L', color: 'Cream', price: new Prisma.Decimal('245.00'), compareAtPrice: new Prisma.Decimal('345.00'), weightG: 410 },
          { sku: 'MOD-LINEN-DRESS-WHITE-XS', size: 'XS', color: 'White', price: new Prisma.Decimal('245.00'), compareAtPrice: new Prisma.Decimal('345.00'), weightG: 380 },
          { sku: 'MOD-LINEN-DRESS-WHITE-S', size: 'S', color: 'White', price: new Prisma.Decimal('245.00'), compareAtPrice: new Prisma.Decimal('345.00'), weightG: 390 },
          { sku: 'MOD-LINEN-DRESS-WHITE-M', size: 'M', color: 'White', price: new Prisma.Decimal('245.00'), compareAtPrice: new Prisma.Decimal('345.00'), weightG: 400 },
          { sku: 'MOD-LINEN-DRESS-WHITE-L', size: 'L', color: 'White', price: new Prisma.Decimal('245.00'), compareAtPrice: new Prisma.Decimal('345.00'), weightG: 410 },
        ],
      },
    },
  });

  // Product 5: Cashmere Crewneck Sweater
  const cashmereSweater = await prisma.product.create({
    data: {
      title: 'Cashmere Crewneck Sweater',
      slug: 'cashmere-crewneck-sweater',
      brand: 'MODETT',
      shortDesc: 'Ultra-soft pure cashmere in timeless crewneck silhouette',
      longDescHtml: `
        <p>The ultimate in luxury knitwear, this pure cashmere sweater is impossibly soft and will only get better with age.</p>
        <h3>Features</h3>
        <ul>
          <li>100% Mongolian Cashmere (2-ply)</li>
          <li>Classic crewneck</li>
          <li>Ribbed cuffs and hem</li>
          <li>Relaxed fit</li>
          <li>Made in Scotland</li>
        </ul>
        <h3>Care</h3>
        <p>Hand wash in cool water with cashmere shampoo. Lay flat to dry. Store folded.</p>
      `,
      status: 'published',
      publishAt: new Date(),
      countryOfOrigin: 'Scotland',
      seoTitle: 'Cashmere Crewneck Sweater - Pure Luxury Knitwear | MODETT',
      seoDescription: 'Impossibly soft 100% Mongolian cashmere sweater. A wardrobe essential that transcends seasons.',
      categories: {
        create: [
          { categoryId: investmentPiecesCategory.id },
          { categoryId: newArrivalsCategory.id },
        ],
      },
      media: {
        create: [
          { assetId: mediaAssets[4].id, position: 1, isCover: true },
        ],
      },
      variants: {
        create: [
          { sku: 'MOD-CASHMERE-SWEATER-CAMEL-XS', size: 'XS', color: 'Camel', price: new Prisma.Decimal('395.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 280 },
          { sku: 'MOD-CASHMERE-SWEATER-CAMEL-S', size: 'S', color: 'Camel', price: new Prisma.Decimal('395.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 290 },
          { sku: 'MOD-CASHMERE-SWEATER-CAMEL-M', size: 'M', color: 'Camel', price: new Prisma.Decimal('395.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 300 },
          { sku: 'MOD-CASHMERE-SWEATER-CAMEL-L', size: 'L', color: 'Camel', price: new Prisma.Decimal('395.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 310 },
          { sku: 'MOD-CASHMERE-SWEATER-GREY-XS', size: 'XS', color: 'Grey', price: new Prisma.Decimal('395.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 280 },
          { sku: 'MOD-CASHMERE-SWEATER-GREY-S', size: 'S', color: 'Grey', price: new Prisma.Decimal('395.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 290 },
          { sku: 'MOD-CASHMERE-SWEATER-GREY-M', size: 'M', color: 'Grey', price: new Prisma.Decimal('395.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 300 },
          { sku: 'MOD-CASHMERE-SWEATER-GREY-L', size: 'L', color: 'Grey', price: new Prisma.Decimal('395.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 310 },
          { sku: 'MOD-CASHMERE-SWEATER-NAVY-XS', size: 'XS', color: 'Navy', price: new Prisma.Decimal('395.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 280 },
          { sku: 'MOD-CASHMERE-SWEATER-NAVY-S', size: 'S', color: 'Navy', price: new Prisma.Decimal('395.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 290 },
          { sku: 'MOD-CASHMERE-SWEATER-NAVY-M', size: 'M', color: 'Navy', price: new Prisma.Decimal('395.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 300 },
          { sku: 'MOD-CASHMERE-SWEATER-NAVY-L', size: 'L', color: 'Navy', price: new Prisma.Decimal('395.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 310 },
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
        <p>A versatile piece that transitions seamlessly from day to evening. The accordion pleats create beautiful movement.</p>
        <h3>Features</h3>
        <ul>
          <li>100% Viscose with subtle sheen</li>
          <li>Fine accordion pleats</li>
          <li>Elastic waistband for comfort</li>
          <li>Midi length (hits mid-calf)</li>
          <li>Fully lined</li>
        </ul>
        <h3>Styling</h3>
        <p>Pair with knitwear and boots for autumn, or with a silk tank and sandals for summer elegance.</p>
      `,
      status: 'published',
      publishAt: new Date(),
      countryOfOrigin: 'France',
      seoTitle: 'Pleated Midi Skirt - Timeless Elegance | MODETT',
      seoDescription: 'Beautifully pleated midi skirt that moves with you. A versatile wardrobe essential.',
      categories: {
        create: [
          { categoryId: investmentPiecesCategory.id },
        ],
      },
      media: {
        create: [
          { assetId: mediaAssets[5].id, position: 1, isCover: true },
        ],
      },
      variants: {
        create: [
          { sku: 'MOD-PLEATED-SKIRT-TERRACOTTA-XS', size: 'XS', color: 'Terracotta', price: new Prisma.Decimal('215.00'), compareAtPrice: new Prisma.Decimal('315.00'), weightG: 280 },
          { sku: 'MOD-PLEATED-SKIRT-TERRACOTTA-S', size: 'S', color: 'Terracotta', price: new Prisma.Decimal('215.00'), compareAtPrice: new Prisma.Decimal('315.00'), weightG: 290 },
          { sku: 'MOD-PLEATED-SKIRT-TERRACOTTA-M', size: 'M', color: 'Terracotta', price: new Prisma.Decimal('215.00'), compareAtPrice: new Prisma.Decimal('315.00'), weightG: 300 },
          { sku: 'MOD-PLEATED-SKIRT-TERRACOTTA-L', size: 'L', color: 'Terracotta', price: new Prisma.Decimal('215.00'), compareAtPrice: new Prisma.Decimal('315.00'), weightG: 310 },
          { sku: 'MOD-PLEATED-SKIRT-BLACK-XS', size: 'XS', color: 'Black', price: new Prisma.Decimal('215.00'), compareAtPrice: new Prisma.Decimal('315.00'), weightG: 280 },
          { sku: 'MOD-PLEATED-SKIRT-BLACK-S', size: 'S', color: 'Black', price: new Prisma.Decimal('215.00'), compareAtPrice: new Prisma.Decimal('315.00'), weightG: 290 },
          { sku: 'MOD-PLEATED-SKIRT-BLACK-M', size: 'M', color: 'Black', price: new Prisma.Decimal('215.00'), compareAtPrice: new Prisma.Decimal('315.00'), weightG: 300 },
          { sku: 'MOD-PLEATED-SKIRT-BLACK-L', size: 'L', color: 'Black', price: new Prisma.Decimal('215.00'), compareAtPrice: new Prisma.Decimal('315.00'), weightG: 310 },
          { sku: 'MOD-PLEATED-SKIRT-OLIVE-XS', size: 'XS', color: 'Olive', price: new Prisma.Decimal('215.00'), compareAtPrice: new Prisma.Decimal('315.00'), weightG: 280 },
          { sku: 'MOD-PLEATED-SKIRT-OLIVE-S', size: 'S', color: 'Olive', price: new Prisma.Decimal('215.00'), compareAtPrice: new Prisma.Decimal('315.00'), weightG: 290 },
          { sku: 'MOD-PLEATED-SKIRT-OLIVE-M', size: 'M', color: 'Olive', price: new Prisma.Decimal('215.00'), compareAtPrice: new Prisma.Decimal('315.00'), weightG: 300 },
          { sku: 'MOD-PLEATED-SKIRT-OLIVE-L', size: 'L', color: 'Olive', price: new Prisma.Decimal('215.00'), compareAtPrice: new Prisma.Decimal('315.00'), weightG: 310 },
        ],
      },
    },
  });

  // Product 7: Silk Slip Dress
  const slipDress = await prisma.product.create({
    data: {
      title: 'Silk Slip Dress',
      slug: 'silk-slip-dress',
      brand: 'MODETT',
      shortDesc: 'Minimalist slip dress in luxurious silk charmeuse',
      longDescHtml: `
        <p>The epitome of refined minimalism. This bias-cut slip dress drapes beautifully and works for any occasion.</p>
        <h3>Features</h3>
        <ul>
          <li>100% Silk Charmeuse</li>
          <li>Bias-cut for perfect drape</li>
          <li>Adjustable spaghetti straps</li>
          <li>V-neckline with lace trim</li>
          <li>Midi length</li>
          <li>Made in France</li>
        </ul>
        <h3>Versatility</h3>
        <p>Wear alone for evening, or layer over t-shirts and under blazers for contemporary daywear.</p>
      `,
      status: 'published',
      publishAt: new Date(),
      countryOfOrigin: 'France',
      seoTitle: 'Silk Slip Dress - Refined Minimalism | MODETT',
      seoDescription: 'Bias-cut silk charmeuse slip dress. Timeless elegance for the modern wardrobe.',
      categories: {
        create: [
          { categoryId: investmentPiecesCategory.id },
          { categoryId: newArrivalsCategory.id },
        ],
      },
      media: {
        create: [
          { assetId: mediaAssets[6].id, position: 1, isCover: true },
        ],
      },
      variants: {
        create: [
          { sku: 'MOD-SLIP-DRESS-CHAMPAGNE-XS', size: 'XS', color: 'Champagne', price: new Prisma.Decimal('365.00'), compareAtPrice: new Prisma.Decimal('485.00'), weightG: 220 },
          { sku: 'MOD-SLIP-DRESS-CHAMPAGNE-S', size: 'S', color: 'Champagne', price: new Prisma.Decimal('365.00'), compareAtPrice: new Prisma.Decimal('485.00'), weightG: 230 },
          { sku: 'MOD-SLIP-DRESS-CHAMPAGNE-M', size: 'M', color: 'Champagne', price: new Prisma.Decimal('365.00'), compareAtPrice: new Prisma.Decimal('485.00'), weightG: 240 },
          { sku: 'MOD-SLIP-DRESS-CHAMPAGNE-L', size: 'L', color: 'Champagne', price: new Prisma.Decimal('365.00'), compareAtPrice: new Prisma.Decimal('485.00'), weightG: 250 },
          { sku: 'MOD-SLIP-DRESS-BLACK-XS', size: 'XS', color: 'Black', price: new Prisma.Decimal('365.00'), compareAtPrice: new Prisma.Decimal('485.00'), weightG: 220 },
          { sku: 'MOD-SLIP-DRESS-BLACK-S', size: 'S', color: 'Black', price: new Prisma.Decimal('365.00'), compareAtPrice: new Prisma.Decimal('485.00'), weightG: 230 },
          { sku: 'MOD-SLIP-DRESS-BLACK-M', size: 'M', color: 'Black', price: new Prisma.Decimal('365.00'), compareAtPrice: new Prisma.Decimal('485.00'), weightG: 240 },
          { sku: 'MOD-SLIP-DRESS-BLACK-L', size: 'L', color: 'Black', price: new Prisma.Decimal('365.00'), compareAtPrice: new Prisma.Decimal('485.00'), weightG: 250 },
        ],
      },
    },
  });

  // Product 8: Wool Wide-Leg Trousers
  const woolTrousers = await prisma.product.create({
    data: {
      title: 'Wool Wide-Leg Trousers',
      slug: 'wool-wide-leg-trousers',
      brand: 'MODETT',
      shortDesc: 'Contemporary wide-leg trousers in premium merino wool',
      longDescHtml: `
        <p>Refined tailoring meets contemporary style in these wide-leg wool trousers.</p>
        <h3>Features</h3>
        <ul>
          <li>100% Merino Wool</li>
          <li>High-rise with front pleats</li>
          <li>Side pockets and welt back pockets</li>
          <li>Wide-leg silhouette</li>
          <li>Full-length with pressed crease</li>
          <li>Made in Italy</li>
        </ul>
        <h3>Fit</h3>
        <p>High-rise fit with relaxed leg. Designed for year-round wear with proper layering.</p>
      `,
      status: 'published',
      publishAt: new Date(),
      countryOfOrigin: 'Italy',
      seoTitle: 'Wool Wide-Leg Trousers - Contemporary Tailoring | MODETT',
      seoDescription: 'Impeccably tailored wide-leg trousers in pure merino wool. A modern wardrobe essential.',
      categories: {
        create: [
          { categoryId: investmentPiecesCategory.id },
        ],
      },
      media: {
        create: [
          { assetId: mediaAssets[7].id, position: 1, isCover: true },
        ],
      },
      variants: {
        create: [
          { sku: 'MOD-WOOL-TROUSERS-CHARCOAL-XS', size: 'XS', color: 'Charcoal', price: new Prisma.Decimal('385.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 420 },
          { sku: 'MOD-WOOL-TROUSERS-CHARCOAL-S', size: 'S', color: 'Charcoal', price: new Prisma.Decimal('385.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 435 },
          { sku: 'MOD-WOOL-TROUSERS-CHARCOAL-M', size: 'M', color: 'Charcoal', price: new Prisma.Decimal('385.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 450 },
          { sku: 'MOD-WOOL-TROUSERS-CHARCOAL-L', size: 'L', color: 'Charcoal', price: new Prisma.Decimal('385.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 465 },
          { sku: 'MOD-WOOL-TROUSERS-CREAM-XS', size: 'XS', color: 'Cream', price: new Prisma.Decimal('385.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 420 },
          { sku: 'MOD-WOOL-TROUSERS-CREAM-S', size: 'S', color: 'Cream', price: new Prisma.Decimal('385.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 435 },
          { sku: 'MOD-WOOL-TROUSERS-CREAM-M', size: 'M', color: 'Cream', price: new Prisma.Decimal('385.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 450 },
          { sku: 'MOD-WOOL-TROUSERS-CREAM-L', size: 'L', color: 'Cream', price: new Prisma.Decimal('385.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 465 },
        ],
      },
    },
  });

  // Product 9: Cotton Poplin Shirt
  const poplinShirt = await prisma.product.create({
    data: {
      title: 'Cotton Poplin Shirt',
      slug: 'cotton-poplin-shirt',
      brand: 'MODETT',
      shortDesc: 'Crisp cotton poplin shirt with classic collar',
      longDescHtml: `
        <p>The perfect white shirt - a wardrobe essential reimagined with impeccable attention to detail.</p>
        <h3>Features</h3>
        <ul>
          <li>100% Egyptian Cotton Poplin</li>
          <li>Classic collar with removable stays</li>
          <li>Mother-of-pearl buttons</li>
          <li>Curved hem for versatile styling</li>
          <li>Relaxed fit</li>
          <li>Made in Portugal</li>
        </ul>
        <h3>Care</h3>
        <p>Machine washable. Iron while slightly damp for best results.</p>
      `,
      status: 'published',
      publishAt: new Date(),
      countryOfOrigin: 'Portugal',
      seoTitle: 'Cotton Poplin Shirt - Classic Wardrobe Staple | MODETT',
      seoDescription: 'Crisp Egyptian cotton poplin shirt. The perfect foundation for any outfit.',
      categories: {
        create: [
          { categoryId: investmentPiecesCategory.id },
        ],
      },
      media: {
        create: [
          { assetId: mediaAssets[8].id, position: 1, isCover: true },
        ],
      },
      variants: {
        create: [
          { sku: 'MOD-POPLIN-SHIRT-WHITE-XS', size: 'XS', color: 'White', price: new Prisma.Decimal('165.00'), compareAtPrice: new Prisma.Decimal('245.00'), weightG: 190 },
          { sku: 'MOD-POPLIN-SHIRT-WHITE-S', size: 'S', color: 'White', price: new Prisma.Decimal('165.00'), compareAtPrice: new Prisma.Decimal('245.00'), weightG: 200 },
          { sku: 'MOD-POPLIN-SHIRT-WHITE-M', size: 'M', color: 'White', price: new Prisma.Decimal('165.00'), compareAtPrice: new Prisma.Decimal('245.00'), weightG: 210 },
          { sku: 'MOD-POPLIN-SHIRT-WHITE-L', size: 'L', color: 'White', price: new Prisma.Decimal('165.00'), compareAtPrice: new Prisma.Decimal('245.00'), weightG: 220 },
          { sku: 'MOD-POPLIN-SHIRT-LIGHTBLUE-XS', size: 'XS', color: 'Light Blue', price: new Prisma.Decimal('165.00'), compareAtPrice: new Prisma.Decimal('245.00'), weightG: 190 },
          { sku: 'MOD-POPLIN-SHIRT-LIGHTBLUE-S', size: 'S', color: 'Light Blue', price: new Prisma.Decimal('165.00'), compareAtPrice: new Prisma.Decimal('245.00'), weightG: 200 },
          { sku: 'MOD-POPLIN-SHIRT-LIGHTBLUE-M', size: 'M', color: 'Light Blue', price: new Prisma.Decimal('165.00'), compareAtPrice: new Prisma.Decimal('245.00'), weightG: 210 },
          { sku: 'MOD-POPLIN-SHIRT-LIGHTBLUE-L', size: 'L', color: 'Light Blue', price: new Prisma.Decimal('165.00'), compareAtPrice: new Prisma.Decimal('245.00'), weightG: 220 },
        ],
      },
    },
  });

  // Product 10: Merino Wool Turtleneck
  const merinoTurtleneck = await prisma.product.create({
    data: {
      title: 'Merino Wool Turtleneck',
      slug: 'merino-wool-turtleneck',
      brand: 'MODETT',
      shortDesc: 'Fine gauge merino wool turtleneck for layering',
      longDescHtml: `
        <p>A winter essential crafted from the finest merino wool. Lightweight yet warm, perfect for layering.</p>
        <h3>Features</h3>
        <ul>
          <li>100% Extra Fine Merino Wool</li>
          <li>Fine gauge knit</li>
          <li>Classic turtleneck</li>
          <li>Slim fit for layering</li>
          <li>Ribbed cuffs and hem</li>
          <li>Made in Italy</li>
        </ul>
        <h3>Versatility</h3>
        <p>Layer under blazers and coats, or wear alone with tailored trousers for refined simplicity.</p>
      `,
      status: 'published',
      publishAt: new Date(),
      countryOfOrigin: 'Italy',
      seoTitle: 'Merino Wool Turtleneck - Winter Essential | MODETT',
      seoDescription: 'Fine gauge merino wool turtleneck. Lightweight warmth for effortless layering.',
      categories: {
        create: [
          { categoryId: investmentPiecesCategory.id },
          { categoryId: newArrivalsCategory.id },
        ],
      },
      media: {
        create: [
          { assetId: mediaAssets[9].id, position: 1, isCover: true },
        ],
      },
      variants: {
        create: [
          { sku: 'MOD-TURTLENECK-IVORY-XS', size: 'XS', color: 'Ivory', price: new Prisma.Decimal('185.00'), compareAtPrice: new Prisma.Decimal('265.00'), weightG: 240 },
          { sku: 'MOD-TURTLENECK-IVORY-S', size: 'S', color: 'Ivory', price: new Prisma.Decimal('185.00'), compareAtPrice: new Prisma.Decimal('265.00'), weightG: 250 },
          { sku: 'MOD-TURTLENECK-IVORY-M', size: 'M', color: 'Ivory', price: new Prisma.Decimal('185.00'), compareAtPrice: new Prisma.Decimal('265.00'), weightG: 260 },
          { sku: 'MOD-TURTLENECK-IVORY-L', size: 'L', color: 'Ivory', price: new Prisma.Decimal('185.00'), compareAtPrice: new Prisma.Decimal('265.00'), weightG: 270 },
          { sku: 'MOD-TURTLENECK-CHARCOAL-XS', size: 'XS', color: 'Charcoal', price: new Prisma.Decimal('185.00'), compareAtPrice: new Prisma.Decimal('265.00'), weightG: 240 },
          { sku: 'MOD-TURTLENECK-CHARCOAL-S', size: 'S', color: 'Charcoal', price: new Prisma.Decimal('185.00'), compareAtPrice: new Prisma.Decimal('265.00'), weightG: 250 },
          { sku: 'MOD-TURTLENECK-CHARCOAL-M', size: 'M', color: 'Charcoal', price: new Prisma.Decimal('185.00'), compareAtPrice: new Prisma.Decimal('265.00'), weightG: 260 },
          { sku: 'MOD-TURTLENECK-CHARCOAL-L', size: 'L', color: 'Charcoal', price: new Prisma.Decimal('185.00'), compareAtPrice: new Prisma.Decimal('265.00'), weightG: 270 },
        ],
      },
    },
  });

  console.log(`✅ Created 10 products with variants`);

  // 5. Create inventory stock for all variants
  console.log('📊 Creating inventory stock...');

  // Get all variants
  const allVariants = await prisma.productVariant.findMany();

  // Create inventory stock for each variant at the single warehouse
  const inventoryPromises = allVariants.map((variant) => {
    // Randomize stock levels for realism (10-40 units)
    const stockLevel = Math.floor(Math.random() * 31) + 10;

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
  console.log(`✅ Created inventory stock for ${allVariants.length} variants at Main Warehouse`);

  // Summary
  console.log('\n📊 Seed Summary:');
  console.log(`   Warehouse: 1 (Main Warehouse)`);
  console.log(`   Categories: 3 (Investment Pieces, New Arrivals, Collections)`);
  console.log(`   Media Assets: ${mediaAssets.length} (high-quality Unsplash images)`);
  console.log(`   Products: 10`);
  console.log(`   Variants: ${allVariants.length} (multiple sizes and colors)`);
  console.log(`   Inventory Records: ${allVariants.length} (all at Main Warehouse)`);
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
