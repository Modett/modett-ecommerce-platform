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
        storageKey: '/images/products/product-1.jpg',
        mime: 'image/jpeg',
        width: 1200,
        height: 1600,
        bytes: 345000,
        altText: 'Beige silk shirt - elegant minimalist fashion',
        focalX: 600,
        focalY: 800,
        renditions: {
          thumbnail: '/images/products/product-1.jpg?w=200&h=300&fit=crop',
          medium: '/images/products/product-1.jpg?w=600&h=800&fit=crop',
          large: '/images/products/product-1.jpg?w=1200&h=1600&fit=crop',
        },
      },
    }),
    // 2. Wide-Leg Trousers
    prisma.mediaAsset.create({
      data: {
        storageKey: '/images/products/product-2.jpg',
        mime: 'image/jpeg',
        width: 1200,
        height: 1600,
        bytes: 338000,
        altText: 'Wide-leg trousers - luxury tailoring',
        focalX: 600,
        focalY: 900,
        renditions: {
          thumbnail: '/images/products/product-2.jpg?w=200&h=300&fit=crop',
          medium: '/images/products/product-2.jpg?w=600&h=800&fit=crop',
          large: '/images/products/product-2.jpg?w=1200&h=1600&fit=crop',
        },
      },
    }),
    // 3. Tailored Blazer
    prisma.mediaAsset.create({
      data: {
        storageKey: '/images/products/product-3.jpg',
        mime: 'image/jpeg',
        width: 1200,
        height: 1600,
        bytes: 352000,
        altText: 'Tailored blazer - modern sophistication',
        focalX: 600,
        focalY: 700,
        renditions: {
          thumbnail: '/images/products/product-3.jpg?w=200&h=300&fit=crop',
          medium: '/images/products/product-3.jpg?w=600&h=800&fit=crop',
          large: '/images/products/product-3.jpg?w=1200&h=1600&fit=crop',
        },
      },
    }),
    // 4. Linen Maxi Dress
    prisma.mediaAsset.create({
      data: {
        storageKey: '/images/products/product-4.jpg',
        mime: 'image/jpeg',
        width: 1200,
        height: 1600,
        bytes: 341000,
        altText: 'Linen maxi dress - effortless elegance',
        focalX: 600,
        focalY: 800,
        renditions: {
          thumbnail: '/images/products/product-4.jpg?w=200&h=300&fit=crop',
          medium: '/images/products/product-4.jpg?w=600&h=800&fit=crop',
          large: '/images/products/product-4.jpg?w=1200&h=1600&fit=crop',
        },
      },
    }),
    // 5. Cashmere Sweater
    prisma.mediaAsset.create({
      data: {
        storageKey: '/images/products/product-5.jpg',
        mime: 'image/jpeg',
        width: 1200,
        height: 1600,
        bytes: 328000,
        altText: 'Cashmere crewneck sweater - luxury knitwear',
        focalX: 600,
        focalY: 750,
        renditions: {
          thumbnail: '/images/products/product-5.jpg?w=200&h=300&fit=crop',
          medium: '/images/products/product-5.jpg?w=600&h=800&fit=crop',
          large: '/images/products/product-5.jpg?w=1200&h=1600&fit=crop',
        },
      },
    }),
    // 6. Pleated Midi Skirt
    prisma.mediaAsset.create({
      data: {
        storageKey: '/images/products/product-6.jpg',
        mime: 'image/jpeg',
        width: 1200,
        height: 1600,
        bytes: 335000,
        altText: 'Pleated midi skirt - timeless design',
        focalX: 600,
        focalY: 900,
        renditions: {
          thumbnail: '/images/products/product-6.jpg?w=200&h=300&fit=crop',
          medium: '/images/products/product-6.jpg?w=600&h=800&fit=crop',
          large: '/images/products/product-6.jpg?w=1200&h=1600&fit=crop',
        },
      },
    }),
    // 7. Silk Slip Dress
    prisma.mediaAsset.create({
      data: {
        storageKey: '/images/products/product-7.jpg',
        mime: 'image/jpeg',
        width: 1200,
        height: 1600,
        bytes: 318000,
        altText: 'Silk slip dress - refined minimalism',
        focalX: 600,
        focalY: 800,
        renditions: {
          thumbnail: '/images/products/product-7.jpg?w=200&h=300&fit=crop',
          medium: '/images/products/product-7.jpg?w=600&h=800&fit=crop',
          large: '/images/products/product-7.jpg?w=1200&h=1600&fit=crop',
        },
      },
    }),
    // 8. Wool Wide-Leg Trousers
    prisma.mediaAsset.create({
      data: {
        storageKey: '/images/products/product-8.jpg',
        mime: 'image/jpeg',
        width: 1200,
        height: 1600,
        bytes: 349000,
        altText: 'Wool wide-leg trousers - contemporary style',
        focalX: 600,
        focalY: 850,
        renditions: {
          thumbnail: '/images/products/product-8.jpg?w=200&h=300&fit=crop',
          medium: '/images/products/product-8.jpg?w=600&h=800&fit=crop',
          large: '/images/products/product-8.jpg?w=1200&h=1600&fit=crop',
        },
      },
    }),
    // 9. Cotton Poplin Shirt
    prisma.mediaAsset.create({
      data: {
        storageKey: '/images/products/product-9.jpg',
        mime: 'image/jpeg',
        width: 1200,
        height: 1600,
        bytes: 325000,
        altText: 'Cotton poplin shirt - classic wardrobe staple',
        focalX: 600,
        focalY: 750,
        renditions: {
          thumbnail: '/images/products/product-9.jpg?w=200&h=300&fit=crop',
          medium: '/images/products/product-9.jpg?w=600&h=800&fit=crop',
          large: '/images/products/product-9.jpg?w=1200&h=1600&fit=crop',
        },
      },
    }),
    // 10. Merino Wool Turtleneck
    prisma.mediaAsset.create({
      data: {
        storageKey: '/images/products/product-10.jpg',
        mime: 'image/jpeg',
        width: 1200,
        height: 1600,
        bytes: 332000,
        altText: 'Merino wool turtleneck - winter essential',
        focalX: 600,
        focalY: 700,
        renditions: {
          thumbnail: '/images/products/product-10.jpg?w=200&h=300&fit=crop',
          medium: '/images/products/product-10.jpg?w=600&h=800&fit=crop',
          large: '/images/products/product-10.jpg?w=1200&h=1600&fit=crop',
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
          { sku: 'MOD-SILK-SHIRT-BEIGE-34', size: '34', color: 'Beige', price: new Prisma.Decimal('285.00'), compareAtPrice: new Prisma.Decimal('385.00'), weightG: 180 },
          { sku: 'MOD-SILK-SHIRT-BEIGE-36', size: '36', color: 'Beige', price: new Prisma.Decimal('285.00'), compareAtPrice: new Prisma.Decimal('385.00'), weightG: 185 },
          { sku: 'MOD-SILK-SHIRT-BEIGE-38', size: '38', color: 'Beige', price: new Prisma.Decimal('285.00'), compareAtPrice: new Prisma.Decimal('385.00'), weightG: 190 },
          { sku: 'MOD-SILK-SHIRT-BEIGE-40', size: '40', color: 'Beige', price: new Prisma.Decimal('285.00'), compareAtPrice: new Prisma.Decimal('385.00'), weightG: 195 },
          { sku: 'MOD-SILK-SHIRT-WHITE-34', size: '34', color: 'White', price: new Prisma.Decimal('285.00'), compareAtPrice: new Prisma.Decimal('385.00'), weightG: 180 },
          { sku: 'MOD-SILK-SHIRT-WHITE-36', size: '36', color: 'White', price: new Prisma.Decimal('285.00'), compareAtPrice: new Prisma.Decimal('385.00'), weightG: 185 },
          { sku: 'MOD-SILK-SHIRT-WHITE-38', size: '38', color: 'White', price: new Prisma.Decimal('285.00'), compareAtPrice: new Prisma.Decimal('385.00'), weightG: 190 },
          { sku: 'MOD-SILK-SHIRT-WHITE-40', size: '40', color: 'White', price: new Prisma.Decimal('285.00'), compareAtPrice: new Prisma.Decimal('385.00'), weightG: 195 },
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
          { sku: 'MOD-WIDE-TROUSERS-BEIGE-34', size: '34', color: 'Beige', price: new Prisma.Decimal('325.00'), compareAtPrice: new Prisma.Decimal('425.00'), weightG: 320 },
          { sku: 'MOD-WIDE-TROUSERS-BEIGE-36', size: '36', color: 'Beige', price: new Prisma.Decimal('325.00'), compareAtPrice: new Prisma.Decimal('425.00'), weightG: 330 },
          { sku: 'MOD-WIDE-TROUSERS-BEIGE-38', size: '38', color: 'Beige', price: new Prisma.Decimal('325.00'), compareAtPrice: new Prisma.Decimal('425.00'), weightG: 340 },
          { sku: 'MOD-WIDE-TROUSERS-BEIGE-40', size: '40', color: 'Beige', price: new Prisma.Decimal('325.00'), compareAtPrice: new Prisma.Decimal('425.00'), weightG: 350 },
          { sku: 'MOD-WIDE-TROUSERS-NAVY-34', size: '34', color: 'Navy', price: new Prisma.Decimal('325.00'), compareAtPrice: new Prisma.Decimal('425.00'), weightG: 320 },
          { sku: 'MOD-WIDE-TROUSERS-NAVY-36', size: '36', color: 'Navy', price: new Prisma.Decimal('325.00'), compareAtPrice: new Prisma.Decimal('425.00'), weightG: 330 },
          { sku: 'MOD-WIDE-TROUSERS-NAVY-38', size: '38', color: 'Navy', price: new Prisma.Decimal('325.00'), compareAtPrice: new Prisma.Decimal('425.00'), weightG: 340 },
          { sku: 'MOD-WIDE-TROUSERS-NAVY-40', size: '40', color: 'Navy', price: new Prisma.Decimal('325.00'), compareAtPrice: new Prisma.Decimal('425.00'), weightG: 350 },
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
          { sku: 'MOD-BLAZER-BLACK-34', size: '34', color: 'Black', price: new Prisma.Decimal('485.00'), compareAtPrice: new Prisma.Decimal('685.00'), weightG: 580 },
          { sku: 'MOD-BLAZER-BLACK-36', size: '36', color: 'Black', price: new Prisma.Decimal('485.00'), compareAtPrice: new Prisma.Decimal('685.00'), weightG: 595 },
          { sku: 'MOD-BLAZER-BLACK-38', size: '38', color: 'Black', price: new Prisma.Decimal('485.00'), compareAtPrice: new Prisma.Decimal('685.00'), weightG: 610 },
          { sku: 'MOD-BLAZER-BLACK-40', size: '40', color: 'Black', price: new Prisma.Decimal('485.00'), compareAtPrice: new Prisma.Decimal('685.00'), weightG: 625 },
          { sku: 'MOD-BLAZER-NAVY-34', size: '34', color: 'Navy', price: new Prisma.Decimal('485.00'), compareAtPrice: new Prisma.Decimal('685.00'), weightG: 580 },
          { sku: 'MOD-BLAZER-NAVY-36', size: '36', color: 'Navy', price: new Prisma.Decimal('485.00'), compareAtPrice: new Prisma.Decimal('685.00'), weightG: 595 },
          { sku: 'MOD-BLAZER-NAVY-38', size: '38', color: 'Navy', price: new Prisma.Decimal('485.00'), compareAtPrice: new Prisma.Decimal('685.00'), weightG: 610 },
          { sku: 'MOD-BLAZER-NAVY-40', size: '40', color: 'Navy', price: new Prisma.Decimal('485.00'), compareAtPrice: new Prisma.Decimal('685.00'), weightG: 625 },
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
          { sku: 'MOD-LINEN-DRESS-CREAM-34', size: '34', color: 'Cream', price: new Prisma.Decimal('245.00'), compareAtPrice: new Prisma.Decimal('345.00'), weightG: 380 },
          { sku: 'MOD-LINEN-DRESS-CREAM-36', size: '36', color: 'Cream', price: new Prisma.Decimal('245.00'), compareAtPrice: new Prisma.Decimal('345.00'), weightG: 390 },
          { sku: 'MOD-LINEN-DRESS-CREAM-38', size: '38', color: 'Cream', price: new Prisma.Decimal('245.00'), compareAtPrice: new Prisma.Decimal('345.00'), weightG: 400 },
          { sku: 'MOD-LINEN-DRESS-CREAM-40', size: '40', color: 'Cream', price: new Prisma.Decimal('245.00'), compareAtPrice: new Prisma.Decimal('345.00'), weightG: 410 },
          { sku: 'MOD-LINEN-DRESS-WHITE-34', size: '34', color: 'White', price: new Prisma.Decimal('245.00'), compareAtPrice: new Prisma.Decimal('345.00'), weightG: 380 },
          { sku: 'MOD-LINEN-DRESS-WHITE-36', size: '36', color: 'White', price: new Prisma.Decimal('245.00'), compareAtPrice: new Prisma.Decimal('345.00'), weightG: 390 },
          { sku: 'MOD-LINEN-DRESS-WHITE-38', size: '38', color: 'White', price: new Prisma.Decimal('245.00'), compareAtPrice: new Prisma.Decimal('345.00'), weightG: 400 },
          { sku: 'MOD-LINEN-DRESS-WHITE-40', size: '40', color: 'White', price: new Prisma.Decimal('245.00'), compareAtPrice: new Prisma.Decimal('345.00'), weightG: 410 },
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
          { sku: 'MOD-CASHMERE-SWEATER-CAMEL-34', size: '34', color: 'Camel', price: new Prisma.Decimal('395.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 280 },
          { sku: 'MOD-CASHMERE-SWEATER-CAMEL-36', size: '36', color: 'Camel', price: new Prisma.Decimal('395.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 290 },
          { sku: 'MOD-CASHMERE-SWEATER-CAMEL-38', size: '38', color: 'Camel', price: new Prisma.Decimal('395.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 300 },
          { sku: 'MOD-CASHMERE-SWEATER-CAMEL-40', size: '40', color: 'Camel', price: new Prisma.Decimal('395.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 310 },
          { sku: 'MOD-CASHMERE-SWEATER-GREY-34', size: '34', color: 'Grey', price: new Prisma.Decimal('395.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 280 },
          { sku: 'MOD-CASHMERE-SWEATER-GREY-36', size: '36', color: 'Grey', price: new Prisma.Decimal('395.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 290 },
          { sku: 'MOD-CASHMERE-SWEATER-GREY-38', size: '38', color: 'Grey', price: new Prisma.Decimal('395.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 300 },
          { sku: 'MOD-CASHMERE-SWEATER-GREY-40', size: '40', color: 'Grey', price: new Prisma.Decimal('395.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 310 },
          { sku: 'MOD-CASHMERE-SWEATER-NAVY-34', size: '34', color: 'Navy', price: new Prisma.Decimal('395.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 280 },
          { sku: 'MOD-CASHMERE-SWEATER-NAVY-36', size: '36', color: 'Navy', price: new Prisma.Decimal('395.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 290 },
          { sku: 'MOD-CASHMERE-SWEATER-NAVY-38', size: '38', color: 'Navy', price: new Prisma.Decimal('395.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 300 },
          { sku: 'MOD-CASHMERE-SWEATER-NAVY-40', size: '40', color: 'Navy', price: new Prisma.Decimal('395.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 310 },
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
          { sku: 'MOD-PLEATED-SKIRT-TERRACOTTA-34', size: '34', color: 'Terracotta', price: new Prisma.Decimal('215.00'), compareAtPrice: new Prisma.Decimal('315.00'), weightG: 280 },
          { sku: 'MOD-PLEATED-SKIRT-TERRACOTTA-36', size: '36', color: 'Terracotta', price: new Prisma.Decimal('215.00'), compareAtPrice: new Prisma.Decimal('315.00'), weightG: 290 },
          { sku: 'MOD-PLEATED-SKIRT-TERRACOTTA-38', size: '38', color: 'Terracotta', price: new Prisma.Decimal('215.00'), compareAtPrice: new Prisma.Decimal('315.00'), weightG: 300 },
          { sku: 'MOD-PLEATED-SKIRT-TERRACOTTA-40', size: '40', color: 'Terracotta', price: new Prisma.Decimal('215.00'), compareAtPrice: new Prisma.Decimal('315.00'), weightG: 310 },
          { sku: 'MOD-PLEATED-SKIRT-BLACK-34', size: '34', color: 'Black', price: new Prisma.Decimal('215.00'), compareAtPrice: new Prisma.Decimal('315.00'), weightG: 280 },
          { sku: 'MOD-PLEATED-SKIRT-BLACK-36', size: '36', color: 'Black', price: new Prisma.Decimal('215.00'), compareAtPrice: new Prisma.Decimal('315.00'), weightG: 290 },
          { sku: 'MOD-PLEATED-SKIRT-BLACK-38', size: '38', color: 'Black', price: new Prisma.Decimal('215.00'), compareAtPrice: new Prisma.Decimal('315.00'), weightG: 300 },
          { sku: 'MOD-PLEATED-SKIRT-BLACK-40', size: '40', color: 'Black', price: new Prisma.Decimal('215.00'), compareAtPrice: new Prisma.Decimal('315.00'), weightG: 310 },
          { sku: 'MOD-PLEATED-SKIRT-OLIVE-34', size: '34', color: 'Olive', price: new Prisma.Decimal('215.00'), compareAtPrice: new Prisma.Decimal('315.00'), weightG: 280 },
          { sku: 'MOD-PLEATED-SKIRT-OLIVE-36', size: '36', color: 'Olive', price: new Prisma.Decimal('215.00'), compareAtPrice: new Prisma.Decimal('315.00'), weightG: 290 },
          { sku: 'MOD-PLEATED-SKIRT-OLIVE-38', size: '38', color: 'Olive', price: new Prisma.Decimal('215.00'), compareAtPrice: new Prisma.Decimal('315.00'), weightG: 300 },
          { sku: 'MOD-PLEATED-SKIRT-OLIVE-40', size: '40', color: 'Olive', price: new Prisma.Decimal('215.00'), compareAtPrice: new Prisma.Decimal('315.00'), weightG: 310 },
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
          { sku: 'MOD-SLIP-DRESS-CHAMPAGNE-34', size: '34', color: 'Champagne', price: new Prisma.Decimal('365.00'), compareAtPrice: new Prisma.Decimal('485.00'), weightG: 220 },
          { sku: 'MOD-SLIP-DRESS-CHAMPAGNE-36', size: '36', color: 'Champagne', price: new Prisma.Decimal('365.00'), compareAtPrice: new Prisma.Decimal('485.00'), weightG: 230 },
          { sku: 'MOD-SLIP-DRESS-CHAMPAGNE-38', size: '38', color: 'Champagne', price: new Prisma.Decimal('365.00'), compareAtPrice: new Prisma.Decimal('485.00'), weightG: 240 },
          { sku: 'MOD-SLIP-DRESS-CHAMPAGNE-40', size: '40', color: 'Champagne', price: new Prisma.Decimal('365.00'), compareAtPrice: new Prisma.Decimal('485.00'), weightG: 250 },
          { sku: 'MOD-SLIP-DRESS-BLACK-34', size: '34', color: 'Black', price: new Prisma.Decimal('365.00'), compareAtPrice: new Prisma.Decimal('485.00'), weightG: 220 },
          { sku: 'MOD-SLIP-DRESS-BLACK-36', size: '36', color: 'Black', price: new Prisma.Decimal('365.00'), compareAtPrice: new Prisma.Decimal('485.00'), weightG: 230 },
          { sku: 'MOD-SLIP-DRESS-BLACK-38', size: '38', color: 'Black', price: new Prisma.Decimal('365.00'), compareAtPrice: new Prisma.Decimal('485.00'), weightG: 240 },
          { sku: 'MOD-SLIP-DRESS-BLACK-40', size: '40', color: 'Black', price: new Prisma.Decimal('365.00'), compareAtPrice: new Prisma.Decimal('485.00'), weightG: 250 },
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
          { sku: 'MOD-WOOL-TROUSERS-CHARCOAL-34', size: '34', color: 'Charcoal', price: new Prisma.Decimal('385.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 420 },
          { sku: 'MOD-WOOL-TROUSERS-CHARCOAL-36', size: '36', color: 'Charcoal', price: new Prisma.Decimal('385.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 435 },
          { sku: 'MOD-WOOL-TROUSERS-CHARCOAL-38', size: '38', color: 'Charcoal', price: new Prisma.Decimal('385.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 450 },
          { sku: 'MOD-WOOL-TROUSERS-CHARCOAL-40', size: '40', color: 'Charcoal', price: new Prisma.Decimal('385.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 465 },
          { sku: 'MOD-WOOL-TROUSERS-CREAM-34', size: '34', color: 'Cream', price: new Prisma.Decimal('385.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 420 },
          { sku: 'MOD-WOOL-TROUSERS-CREAM-36', size: '36', color: 'Cream', price: new Prisma.Decimal('385.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 435 },
          { sku: 'MOD-WOOL-TROUSERS-CREAM-38', size: '38', color: 'Cream', price: new Prisma.Decimal('385.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 450 },
          { sku: 'MOD-WOOL-TROUSERS-CREAM-40', size: '40', color: 'Cream', price: new Prisma.Decimal('385.00'), compareAtPrice: new Prisma.Decimal('525.00'), weightG: 465 },
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
          { sku: 'MOD-POPLIN-SHIRT-WHITE-34', size: '34', color: 'White', price: new Prisma.Decimal('165.00'), compareAtPrice: new Prisma.Decimal('245.00'), weightG: 190 },
          { sku: 'MOD-POPLIN-SHIRT-WHITE-36', size: '36', color: 'White', price: new Prisma.Decimal('165.00'), compareAtPrice: new Prisma.Decimal('245.00'), weightG: 200 },
          { sku: 'MOD-POPLIN-SHIRT-WHITE-38', size: '38', color: 'White', price: new Prisma.Decimal('165.00'), compareAtPrice: new Prisma.Decimal('245.00'), weightG: 210 },
          { sku: 'MOD-POPLIN-SHIRT-WHITE-40', size: '40', color: 'White', price: new Prisma.Decimal('165.00'), compareAtPrice: new Prisma.Decimal('245.00'), weightG: 220 },
          { sku: 'MOD-POPLIN-SHIRT-LIGHTBLUE-34', size: '34', color: 'Light Blue', price: new Prisma.Decimal('165.00'), compareAtPrice: new Prisma.Decimal('245.00'), weightG: 190 },
          { sku: 'MOD-POPLIN-SHIRT-LIGHTBLUE-36', size: '36', color: 'Light Blue', price: new Prisma.Decimal('165.00'), compareAtPrice: new Prisma.Decimal('245.00'), weightG: 200 },
          { sku: 'MOD-POPLIN-SHIRT-LIGHTBLUE-38', size: '38', color: 'Light Blue', price: new Prisma.Decimal('165.00'), compareAtPrice: new Prisma.Decimal('245.00'), weightG: 210 },
          { sku: 'MOD-POPLIN-SHIRT-LIGHTBLUE-40', size: '40', color: 'Light Blue', price: new Prisma.Decimal('165.00'), compareAtPrice: new Prisma.Decimal('245.00'), weightG: 220 },
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
          { sku: 'MOD-TURTLENECK-IVORY-34', size: '34', color: 'Ivory', price: new Prisma.Decimal('185.00'), compareAtPrice: new Prisma.Decimal('265.00'), weightG: 240 },
          { sku: 'MOD-TURTLENECK-IVORY-36', size: '36', color: 'Ivory', price: new Prisma.Decimal('185.00'), compareAtPrice: new Prisma.Decimal('265.00'), weightG: 250 },
          { sku: 'MOD-TURTLENECK-IVORY-38', size: '38', color: 'Ivory', price: new Prisma.Decimal('185.00'), compareAtPrice: new Prisma.Decimal('265.00'), weightG: 260 },
          { sku: 'MOD-TURTLENECK-IVORY-40', size: '40', color: 'Ivory', price: new Prisma.Decimal('185.00'), compareAtPrice: new Prisma.Decimal('265.00'), weightG: 270 },
          { sku: 'MOD-TURTLENECK-CHARCOAL-34', size: '34', color: 'Charcoal', price: new Prisma.Decimal('185.00'), compareAtPrice: new Prisma.Decimal('265.00'), weightG: 240 },
          { sku: 'MOD-TURTLENECK-CHARCOAL-36', size: '36', color: 'Charcoal', price: new Prisma.Decimal('185.00'), compareAtPrice: new Prisma.Decimal('265.00'), weightG: 250 },
          { sku: 'MOD-TURTLENECK-CHARCOAL-38', size: '38', color: 'Charcoal', price: new Prisma.Decimal('185.00'), compareAtPrice: new Prisma.Decimal('265.00'), weightG: 260 },
          { sku: 'MOD-TURTLENECK-CHARCOAL-40', size: '40', color: 'Charcoal', price: new Prisma.Decimal('185.00'), compareAtPrice: new Prisma.Decimal('265.00'), weightG: 270 },
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
