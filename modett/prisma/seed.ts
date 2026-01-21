import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // 1. Create warehouse location for inventory
  console.log("📦 Creating warehouse location...");
  const warehouse = await prisma.location.create({
    data: {
      type: "warehouse",
      name: "Main Warehouse",
      address: {
        street: "123 Warehouse District",
        city: "New York",
        state: "NY",
        zip: "10001",
        country: "US",
      },
    },
  });
  console.log(`✅ Created warehouse: ${warehouse.name}`);

  // 2. Create categories (product types) and collections
  console.log("📁 Creating categories and collections...");

  // Product Type Categories
  const topsCategory = await prisma.category.create({
    data: {
      name: "Tops",
      slug: "tops",
      position: 1,
    },
  });

  const bottomsCategory = await prisma.category.create({
    data: {
      name: "Bottoms",
      slug: "bottoms",
      position: 2,
    },
  });

  const dressesCategory = await prisma.category.create({
    data: {
      name: "Dresses",
      slug: "dresses",
      position: 3,
    },
  });

  const outerwearCategory = await prisma.category.create({
    data: {
      name: "Outerwear",
      slug: "outerwear",
      position: 4,
    },
  });

  // Collections (curated groups)
  const investmentPiecesCategory = await prisma.category.create({
    data: {
      name: "Investment Pieces",
      slug: "investment-pieces",
      position: 101,
    },
  });

  const newArrivalsCategory = await prisma.category.create({
    data: {
      name: "New Arrivals",
      slug: "new-arrivals",
      position: 102,
    },
  });

  const collectionsCategory = await prisma.category.create({
    data: {
      name: "Collections",
      slug: "collections",
      position: 103,
    },
  });
  console.log(`✅ Created 4 categories and 3 collections`);

  // 3. Create media assets (using high-quality Unsplash images)
  console.log("🖼️  Creating media assets...");
  const mediaAssets = await Promise.all([
    // 1. Beige Silk Shirt
    prisma.mediaAsset.create({
      data: {
        storageKey: "/images/products/product-1.jpg",
        mime: "image/jpeg",
        width: 1200,
        height: 1600,
        bytes: 345000,
        altText: "Beige silk shirt - elegant minimalist fashion",
        focalX: 600,
        focalY: 800,
        renditions: {
          thumbnail: "/images/products/product-1.jpg?w=200&h=300&fit=crop",
          medium: "/images/products/product-1.jpg?w=600&h=800&fit=crop",
          large: "/images/products/product-1.jpg?w=1200&h=1600&fit=crop",
        },
      },
    }),
    // 2. Wide-Leg Trousers
    prisma.mediaAsset.create({
      data: {
        storageKey: "/images/products/product-2.jpg",
        mime: "image/jpeg",
        width: 1200,
        height: 1600,
        bytes: 338000,
        altText: "Wide-leg trousers - luxury tailoring",
        focalX: 600,
        focalY: 900,
        renditions: {
          thumbnail: "/images/products/product-2.jpg?w=200&h=300&fit=crop",
          medium: "/images/products/product-2.jpg?w=600&h=800&fit=crop",
          large: "/images/products/product-2.jpg?w=1200&h=1600&fit=crop",
        },
      },
    }),
    // 3. Tailored Blazer
    prisma.mediaAsset.create({
      data: {
        storageKey: "/images/products/product-3.jpg",
        mime: "image/jpeg",
        width: 1200,
        height: 1600,
        bytes: 352000,
        altText: "Tailored blazer - modern sophistication",
        focalX: 600,
        focalY: 700,
        renditions: {
          thumbnail: "/images/products/product-3.jpg?w=200&h=300&fit=crop",
          medium: "/images/products/product-3.jpg?w=600&h=800&fit=crop",
          large: "/images/products/product-3.jpg?w=1200&h=1600&fit=crop",
        },
      },
    }),
    // 4. Linen Maxi Dress
    prisma.mediaAsset.create({
      data: {
        storageKey: "/images/products/product-4.jpg",
        mime: "image/jpeg",
        width: 1200,
        height: 1600,
        bytes: 341000,
        altText: "Linen maxi dress - effortless elegance",
        focalX: 600,
        focalY: 800,
        renditions: {
          thumbnail: "/images/products/product-4.jpg?w=200&h=300&fit=crop",
          medium: "/images/products/product-4.jpg?w=600&h=800&fit=crop",
          large: "/images/products/product-4.jpg?w=1200&h=1600&fit=crop",
        },
      },
    }),
    // 5. Cashmere Sweater
    prisma.mediaAsset.create({
      data: {
        storageKey: "/images/products/product-5.jpg",
        mime: "image/jpeg",
        width: 1200,
        height: 1600,
        bytes: 328000,
        altText: "Cashmere crewneck sweater - luxury knitwear",
        focalX: 600,
        focalY: 750,
        renditions: {
          thumbnail: "/images/products/product-5.jpg?w=200&h=300&fit=crop",
          medium: "/images/products/product-5.jpg?w=600&h=800&fit=crop",
          large: "/images/products/product-5.jpg?w=1200&h=1600&fit=crop",
        },
      },
    }),
    // 6. Pleated Midi Skirt
    prisma.mediaAsset.create({
      data: {
        storageKey: "/images/products/product-6.jpg",
        mime: "image/jpeg",
        width: 1200,
        height: 1600,
        bytes: 335000,
        altText: "Pleated midi skirt - timeless design",
        focalX: 600,
        focalY: 900,
        renditions: {
          thumbnail: "/images/products/product-6.jpg?w=200&h=300&fit=crop",
          medium: "/images/products/product-6.jpg?w=600&h=800&fit=crop",
          large: "/images/products/product-6.jpg?w=1200&h=1600&fit=crop",
        },
      },
    }),
    // 7. Silk Slip Dress
    prisma.mediaAsset.create({
      data: {
        storageKey: "/images/products/product-7.jpg",
        mime: "image/jpeg",
        width: 1200,
        height: 1600,
        bytes: 318000,
        altText: "Silk slip dress - refined minimalism",
        focalX: 600,
        focalY: 800,
        renditions: {
          thumbnail: "/images/products/product-7.jpg?w=200&h=300&fit=crop",
          medium: "/images/products/product-7.jpg?w=600&h=800&fit=crop",
          large: "/images/products/product-7.jpg?w=1200&h=1600&fit=crop",
        },
      },
    }),
    // 8. Wool Wide-Leg Trousers
    prisma.mediaAsset.create({
      data: {
        storageKey: "/images/products/product-8.jpg",
        mime: "image/jpeg",
        width: 1200,
        height: 1600,
        bytes: 349000,
        altText: "Wool wide-leg trousers - contemporary style",
        focalX: 600,
        focalY: 850,
        renditions: {
          thumbnail: "/images/products/product-8.jpg?w=200&h=300&fit=crop",
          medium: "/images/products/product-8.jpg?w=600&h=800&fit=crop",
          large: "/images/products/product-8.jpg?w=1200&h=1600&fit=crop",
        },
      },
    }),
    // 9. Cotton Poplin Shirt
    prisma.mediaAsset.create({
      data: {
        storageKey: "/images/products/product-9.jpg",
        mime: "image/jpeg",
        width: 1200,
        height: 1600,
        bytes: 325000,
        altText: "Cotton poplin shirt - classic wardrobe staple",
        focalX: 600,
        focalY: 750,
        renditions: {
          thumbnail: "/images/products/product-9.jpg?w=200&h=300&fit=crop",
          medium: "/images/products/product-9.jpg?w=600&h=800&fit=crop",
          large: "/images/products/product-9.jpg?w=1200&h=1600&fit=crop",
        },
      },
    }),
    // 10. Merino Wool Turtleneck
    prisma.mediaAsset.create({
      data: {
        storageKey: "/images/products/product-10.jpg",
        mime: "image/jpeg",
        width: 1200,
        height: 1600,
        bytes: 332000,
        altText: "Merino wool turtleneck - winter essential",
        focalX: 600,
        focalY: 700,
        renditions: {
          thumbnail: "/images/products/product-10.jpg?w=200&h=300&fit=crop",
          medium: "/images/products/product-10.jpg?w=600&h=800&fit=crop",
          large: "/images/products/product-10.jpg?w=1200&h=1600&fit=crop",
        },
      },
    }),
  ]);
  console.log(`✅ Created ${mediaAssets.length} media assets`);

  // 4. Create products with variants
  console.log("👕 Creating products and variants...");

  // Product 1: Crispy Silk Shirt
  const silkShirt = await prisma.product.create({
    data: {
      title: "Crispy Silk Shirt",
      slug: "crispy-silk-shirt",
      brand: "MODETT",
      shortDesc:
        "Luxuriously crafted from pure mulberry silk with a crisp finish",
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
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "Italy",
      seoTitle: "Crispy Silk Shirt - Premium Mulberry Silk | MODETT",
      seoDescription:
        "Invest in timeless elegance with our crispy silk shirt. Crafted from 100% mulberry silk in Italy for the discerning modern woman.",
      categories: {
        create: [
          { categoryId: topsCategory.id },
          { categoryId: investmentPiecesCategory.id },
          { categoryId: newArrivalsCategory.id },
        ],
      },
      media: {
        create: [
          { assetId: mediaAssets[0].id, position: 1, isCover: true },
          { assetId: mediaAssets[1].id, position: 2, isCover: false },
          { assetId: mediaAssets[2].id, position: 3, isCover: false },
          { assetId: mediaAssets[3].id, position: 4, isCover: false },
          { assetId: mediaAssets[4].id, position: 5, isCover: false },
          { assetId: mediaAssets[5].id, position: 6, isCover: false },
        ],
      },
      variants: {
        create: [
          {
            sku: "MOD-SILK-SHIRT-BEIGE-34",
            size: "34",
            color: "Beige",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 180,
          },
          {
            sku: "MOD-SILK-SHIRT-BEIGE-36",
            size: "36",
            color: "Beige",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 185,
          },
          {
            sku: "MOD-SILK-SHIRT-BEIGE-38",
            size: "38",
            color: "Beige",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 190,
          },
          {
            sku: "MOD-SILK-SHIRT-BEIGE-40",
            size: "40",
            color: "Beige",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 195,
          },
        ],
      },
    },
  });

  // Product 2: Wide-Leg Silk Trousers
  const wideLegTrousers = await prisma.product.create({
    data: {
      title: "Wide-Leg Silk Trousers",
      slug: "wide-leg-silk-trousers",
      brand: "MODETT",
      shortDesc: "Flowing wide-leg trousers in premium silk blend",
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
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "Italy",
      seoTitle: "Wide-Leg Silk Trousers - Luxury Tailoring | MODETT",
      seoDescription:
        "Flowing elegance meets impeccable Italian tailoring in our wide-leg silk trousers.",
      categories: {
        create: [
          { categoryId: bottomsCategory.id },
          { categoryId: investmentPiecesCategory.id },
        ],
      },
      media: {
        create: [
          { assetId: mediaAssets[1].id, position: 1, isCover: true },
          { assetId: mediaAssets[2].id, position: 2, isCover: false },
          { assetId: mediaAssets[3].id, position: 3, isCover: false },
          { assetId: mediaAssets[4].id, position: 4, isCover: false },
          { assetId: mediaAssets[5].id, position: 5, isCover: false },
          { assetId: mediaAssets[6].id, position: 6, isCover: false },
        ],
      },
      variants: {
        create: [
          {
            sku: "MOD-WIDE-TROUSERS-BEIGE-34",
            size: "34",
            color: "Beige",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 320,
          },
          {
            sku: "MOD-WIDE-TROUSERS-BEIGE-36",
            size: "36",
            color: "Beige",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 330,
          },
          {
            sku: "MOD-WIDE-TROUSERS-BEIGE-38",
            size: "38",
            color: "Beige",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 340,
          },
          {
            sku: "MOD-WIDE-TROUSERS-BEIGE-40",
            size: "40",
            color: "Beige",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 350,
          },
        ],
      },
    },
  });

  // Product 3: Tailored Wool Blazer
  const tailoredBlazer = await prisma.product.create({
    data: {
      title: "Tailored Wool Blazer",
      slug: "tailored-wool-blazer",
      brand: "MODETT",
      shortDesc: "Sharp tailoring in premium Italian virgin wool",
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
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "Italy",
      seoTitle: "Tailored Wool Blazer - Italian Craftsmanship | MODETT",
      seoDescription:
        "Impeccable Italian tailoring in 100% virgin wool. A true investment piece for the modern wardrobe.",
      categories: {
        create: [
          { categoryId: outerwearCategory.id },
          { categoryId: investmentPiecesCategory.id },
        ],
      },
      media: {
        create: [
          { assetId: mediaAssets[2].id, position: 1, isCover: true },
          { assetId: mediaAssets[3].id, position: 2, isCover: false },
          { assetId: mediaAssets[4].id, position: 3, isCover: false },
          { assetId: mediaAssets[5].id, position: 4, isCover: false },
          { assetId: mediaAssets[6].id, position: 5, isCover: false },
          { assetId: mediaAssets[7].id, position: 6, isCover: false },
        ],
      },
      variants: {
        create: [
          {
            sku: "MOD-BLAZER-BLACK-34",
            size: "34",
            color: "Black",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 580,
          },
          {
            sku: "MOD-BLAZER-BLACK-36",
            size: "36",
            color: "Black",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 595,
          },
          {
            sku: "MOD-BLAZER-BLACK-38",
            size: "38",
            color: "Black",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 610,
          },
          {
            sku: "MOD-BLAZER-BLACK-40",
            size: "40",
            color: "Black",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 625,
          },
        ],
      },
    },
  });

  // Product 4: Linen Maxi Dress
  const linenDress = await prisma.product.create({
    data: {
      title: "Linen Maxi Dress",
      slug: "linen-maxi-dress",
      brand: "MODETT",
      shortDesc: "Flowing maxi dress in breathable European linen",
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
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "Portugal",
      seoTitle: "Linen Maxi Dress - Sustainable Luxury | MODETT",
      seoDescription:
        "Breathable elegance in 100% European linen. Perfect for any season.",
      categories: {
        create: [
          { categoryId: dressesCategory.id },
          { categoryId: investmentPiecesCategory.id },
          { categoryId: collectionsCategory.id },
        ],
      },
      media: {
        create: [
          { assetId: mediaAssets[3].id, position: 1, isCover: true },
          { assetId: mediaAssets[4].id, position: 2, isCover: false },
          { assetId: mediaAssets[5].id, position: 3, isCover: false },
          { assetId: mediaAssets[6].id, position: 4, isCover: false },
          { assetId: mediaAssets[7].id, position: 5, isCover: false },
          { assetId: mediaAssets[8].id, position: 6, isCover: false },
        ],
      },
      variants: {
        create: [
          {
            sku: "MOD-LINEN-DRESS-CREAM-34",
            size: "34",
            color: "Cream",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 380,
          },
          {
            sku: "MOD-LINEN-DRESS-CREAM-36",
            size: "36",
            color: "Cream",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 390,
          },
          {
            sku: "MOD-LINEN-DRESS-CREAM-38",
            size: "38",
            color: "Cream",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 400,
          },
          {
            sku: "MOD-LINEN-DRESS-CREAM-40",
            size: "40",
            color: "Cream",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 410,
          },
        ],
      },
    },
  });

  // Product 5: Cashmere Crewneck Sweater
  const cashmereSweater = await prisma.product.create({
    data: {
      title: "Cashmere Crewneck Sweater",
      slug: "cashmere-crewneck-sweater",
      brand: "MODETT",
      shortDesc: "Ultra-soft pure cashmere in timeless crewneck silhouette",
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
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "Scotland",
      seoTitle: "Cashmere Crewneck Sweater - Pure Luxury Knitwear | MODETT",
      seoDescription:
        "Impossibly soft 100% Mongolian cashmere sweater. A wardrobe essential that transcends seasons.",
      categories: {
        create: [
          { categoryId: topsCategory.id },
          { categoryId: investmentPiecesCategory.id },
          { categoryId: newArrivalsCategory.id },
        ],
      },
      media: {
        create: [
          { assetId: mediaAssets[4].id, position: 1, isCover: true },
          { assetId: mediaAssets[5].id, position: 2, isCover: false },
          { assetId: mediaAssets[6].id, position: 3, isCover: false },
          { assetId: mediaAssets[7].id, position: 4, isCover: false },
          { assetId: mediaAssets[8].id, position: 5, isCover: false },
          { assetId: mediaAssets[9].id, position: 6, isCover: false },
        ],
      },
      variants: {
        create: [
          {
            sku: "MOD-CASHMERE-SWEATER-CAMEL-34",
            size: "34",
            color: "Camel",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 280,
          },
          {
            sku: "MOD-CASHMERE-SWEATER-CAMEL-36",
            size: "36",
            color: "Camel",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 290,
          },
          {
            sku: "MOD-CASHMERE-SWEATER-CAMEL-38",
            size: "38",
            color: "Camel",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 300,
          },
          {
            sku: "MOD-CASHMERE-SWEATER-CAMEL-40",
            size: "40",
            color: "Camel",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 310,
          },
        ],
      },
    },
  });

  // Product 6: Pleated Midi Skirt
  const pleatedSkirt = await prisma.product.create({
    data: {
      title: "Pleated Midi Skirt",
      slug: "pleated-midi-skirt",
      brand: "MODETT",
      shortDesc: "Elegant pleated skirt with timeless appeal",
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
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "France",
      seoTitle: "Pleated Midi Skirt - Timeless Elegance | MODETT",
      seoDescription:
        "Beautifully pleated midi skirt that moves with you. A versatile wardrobe essential.",
      categories: {
        create: [
          { categoryId: bottomsCategory.id },
          { categoryId: investmentPiecesCategory.id },
        ],
      },
      media: {
        create: [
          { assetId: mediaAssets[5].id, position: 1, isCover: true },
          { assetId: mediaAssets[6].id, position: 2, isCover: false },
          { assetId: mediaAssets[7].id, position: 3, isCover: false },
          { assetId: mediaAssets[8].id, position: 4, isCover: false },
          { assetId: mediaAssets[9].id, position: 5, isCover: false },
          { assetId: mediaAssets[0].id, position: 6, isCover: false },
        ],
      },
      variants: {
        create: [
          {
            sku: "MOD-PLEATED-SKIRT-TERRACOTTA-34",
            size: "34",
            color: "Terracotta",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 280,
          },
          {
            sku: "MOD-PLEATED-SKIRT-TERRACOTTA-36",
            size: "36",
            color: "Terracotta",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 290,
          },
          {
            sku: "MOD-PLEATED-SKIRT-TERRACOTTA-38",
            size: "38",
            color: "Terracotta",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 300,
          },
          {
            sku: "MOD-PLEATED-SKIRT-TERRACOTTA-40",
            size: "40",
            color: "Terracotta",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 310,
          },
        ],
      },
    },
  });

  // Product 7: Silk Slip Dress
  const slipDress = await prisma.product.create({
    data: {
      title: "Silk Slip Dress",
      slug: "silk-slip-dress",
      brand: "MODETT",
      shortDesc: "Minimalist slip dress in luxurious silk charmeuse",
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
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "France",
      seoTitle: "Silk Slip Dress - Refined Minimalism | MODETT",
      seoDescription:
        "Bias-cut silk charmeuse slip dress. Timeless elegance for the modern wardrobe.",
      categories: {
        create: [
          { categoryId: dressesCategory.id },
          { categoryId: investmentPiecesCategory.id },
          { categoryId: newArrivalsCategory.id },
        ],
      },
      media: {
        create: [
          { assetId: mediaAssets[6].id, position: 1, isCover: true },
          { assetId: mediaAssets[7].id, position: 2, isCover: false },
          { assetId: mediaAssets[8].id, position: 3, isCover: false },
          { assetId: mediaAssets[9].id, position: 4, isCover: false },
          { assetId: mediaAssets[0].id, position: 5, isCover: false },
          { assetId: mediaAssets[1].id, position: 6, isCover: false },
        ],
      },
      variants: {
        create: [
          {
            sku: "MOD-SLIP-DRESS-CHAMPAGNE-34",
            size: "34",
            color: "Champagne",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 220,
          },
          {
            sku: "MOD-SLIP-DRESS-CHAMPAGNE-36",
            size: "36",
            color: "Champagne",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 230,
          },
          {
            sku: "MOD-SLIP-DRESS-CHAMPAGNE-38",
            size: "38",
            color: "Champagne",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 240,
          },
          {
            sku: "MOD-SLIP-DRESS-CHAMPAGNE-40",
            size: "40",
            color: "Champagne",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 250,
          },
        ],
      },
    },
  });

  // Product 8: Wool Wide-Leg Trousers
  const woolTrousers = await prisma.product.create({
    data: {
      title: "Wool Wide-Leg Trousers",
      slug: "wool-wide-leg-trousers",
      brand: "MODETT",
      shortDesc: "Contemporary wide-leg trousers in premium merino wool",
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
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "Italy",
      seoTitle: "Wool Wide-Leg Trousers - Contemporary Tailoring | MODETT",
      seoDescription:
        "Impeccably tailored wide-leg trousers in pure merino wool. A modern wardrobe essential.",
      categories: {
        create: [
          { categoryId: bottomsCategory.id },
          { categoryId: investmentPiecesCategory.id },
        ],
      },
      media: {
        create: [
          { assetId: mediaAssets[7].id, position: 1, isCover: true },
          { assetId: mediaAssets[8].id, position: 2, isCover: false },
          { assetId: mediaAssets[9].id, position: 3, isCover: false },
          { assetId: mediaAssets[0].id, position: 4, isCover: false },
          { assetId: mediaAssets[1].id, position: 5, isCover: false },
          { assetId: mediaAssets[2].id, position: 6, isCover: false },
        ],
      },
      variants: {
        create: [
          {
            sku: "MOD-WOOL-TROUSERS-CHARCOAL-34",
            size: "34",
            color: "Charcoal",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 420,
          },
          {
            sku: "MOD-WOOL-TROUSERS-CHARCOAL-36",
            size: "36",
            color: "Charcoal",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 435,
          },
          {
            sku: "MOD-WOOL-TROUSERS-CHARCOAL-38",
            size: "38",
            color: "Charcoal",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 450,
          },
          {
            sku: "MOD-WOOL-TROUSERS-CHARCOAL-40",
            size: "40",
            color: "Charcoal",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 465,
          },
        ],
      },
    },
  });

  // Product 9: Cotton Poplin Shirt
  const poplinShirt = await prisma.product.create({
    data: {
      title: "Cotton Poplin Shirt",
      slug: "cotton-poplin-shirt",
      brand: "MODETT",
      shortDesc: "Crisp cotton poplin shirt with classic collar",
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
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "Portugal",
      seoTitle: "Cotton Poplin Shirt - Classic Wardrobe Staple | MODETT",
      seoDescription:
        "Crisp Egyptian cotton poplin shirt. The perfect foundation for any outfit.",
      categories: {
        create: [
          { categoryId: topsCategory.id },
          { categoryId: investmentPiecesCategory.id },
        ],
      },
      media: {
        create: [
          { assetId: mediaAssets[8].id, position: 1, isCover: true },
          { assetId: mediaAssets[9].id, position: 2, isCover: false },
          { assetId: mediaAssets[0].id, position: 3, isCover: false },
          { assetId: mediaAssets[1].id, position: 4, isCover: false },
          { assetId: mediaAssets[2].id, position: 5, isCover: false },
          { assetId: mediaAssets[3].id, position: 6, isCover: false },
        ],
      },
      variants: {
        create: [
          {
            sku: "MOD-POPLIN-SHIRT-WHITE-34",
            size: "34",
            color: "White",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 190,
          },
          {
            sku: "MOD-POPLIN-SHIRT-WHITE-36",
            size: "36",
            color: "White",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 200,
          },
          {
            sku: "MOD-POPLIN-SHIRT-WHITE-38",
            size: "38",
            color: "White",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 210,
          },
          {
            sku: "MOD-POPLIN-SHIRT-WHITE-40",
            size: "40",
            color: "White",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 220,
          },
        ],
      },
    },
  });

  // Product 10: Merino Wool Turtleneck
  const merinoTurtleneck = await prisma.product.create({
    data: {
      title: "Merino Wool Turtleneck",
      slug: "merino-wool-turtleneck",
      brand: "MODETT",
      shortDesc: "Fine gauge merino wool turtleneck for layering",
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
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "Italy",
      seoTitle: "Merino Wool Turtleneck - Winter Essential | MODETT",
      seoDescription:
        "Fine gauge merino wool turtleneck. Lightweight warmth for effortless layering.",
      categories: {
        create: [
          { categoryId: topsCategory.id },
          { categoryId: investmentPiecesCategory.id },
          { categoryId: newArrivalsCategory.id },
        ],
      },
      media: {
        create: [
          { assetId: mediaAssets[9].id, position: 1, isCover: true },
          { assetId: mediaAssets[0].id, position: 2, isCover: false },
          { assetId: mediaAssets[1].id, position: 3, isCover: false },
          { assetId: mediaAssets[2].id, position: 4, isCover: false },
          { assetId: mediaAssets[3].id, position: 5, isCover: false },
          { assetId: mediaAssets[4].id, position: 6, isCover: false },
        ],
      },
      variants: {
        create: [
          {
            sku: "MOD-TURTLENECK-IVORY-34",
            size: "34",
            color: "Ivory",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 240,
          },
          {
            sku: "MOD-TURTLENECK-IVORY-36",
            size: "36",
            color: "Ivory",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 250,
          },
          {
            sku: "MOD-TURTLENECK-IVORY-38",
            size: "38",
            color: "Ivory",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 260,
          },
          {
            sku: "MOD-TURTLENECK-IVORY-40",
            size: "40",
            color: "Ivory",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 270,
          },
        ],
      },
    },
  });

  // Product 11: Oversized Linen Blazer
  const linenBlazer = await prisma.product.create({
    data: {
      title: "Oversized Linen Blazer",
      slug: "oversized-linen-blazer",
      brand: "MODETT",
      shortDesc: "Relaxed fit linen blazer for effortless sophistication",
      longDescHtml: `<p>A contemporary take on the classic blazer. Made from breathable European linen.</p>`,
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "Portugal",
      categories: {
        create: [
          { categoryId: outerwearCategory.id },
          { categoryId: investmentPiecesCategory.id },
        ],
      },
      media: {
        create: [{ assetId: mediaAssets[0].id, position: 1, isCover: true }],
      },
      variants: {
        create: [
          {
            sku: "MOD-LINEN-BLAZER-SAND-34",
            size: "34",
            color: "Sand",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 520,
          },
          {
            sku: "MOD-LINEN-BLAZER-SAND-36",
            size: "36",
            color: "Sand",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 535,
          },
          {
            sku: "MOD-LINEN-BLAZER-SAND-38",
            size: "38",
            color: "Sand",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 550,
          },
          {
            sku: "MOD-LINEN-BLAZER-SAND-40",
            size: "40",
            color: "Sand",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 565,
          },
        ],
      },
    },
  });

  // Product 12: Cropped Wide-Leg Pants
  const croppedPants = await prisma.product.create({
    data: {
      title: "Cropped Wide-Leg Pants",
      slug: "cropped-wide-leg-pants",
      brand: "MODETT",
      shortDesc: "Contemporary cropped trousers with relaxed silhouette",
      longDescHtml: `<p>Modern tailoring in premium cotton blend. Perfect for transitional seasons.</p>`,
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "Italy",
      categories: {
        create: [
          { categoryId: bottomsCategory.id },
          { categoryId: newArrivalsCategory.id },
        ],
      },
      media: {
        create: [{ assetId: mediaAssets[1].id, position: 1, isCover: true }],
      },
      variants: {
        create: [
          {
            sku: "MOD-CROP-PANTS-KHAKI-34",
            size: "34",
            color: "Khaki",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 350,
          },
          {
            sku: "MOD-CROP-PANTS-KHAKI-36",
            size: "36",
            color: "Khaki",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 365,
          },
          {
            sku: "MOD-CROP-PANTS-KHAKI-38",
            size: "38",
            color: "Khaki",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 380,
          },
          {
            sku: "MOD-CROP-PANTS-KHAKI-40",
            size: "40",
            color: "Khaki",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 395,
          },
        ],
      },
    },
  });

  // Product 13: Double-Breasted Coat
  const doubleCoat = await prisma.product.create({
    data: {
      title: "Double-Breasted Coat",
      slug: "double-breasted-coat",
      brand: "MODETT",
      shortDesc: "Classic double-breasted coat in premium wool",
      longDescHtml: `<p>Timeless outerwear with impeccable Italian tailoring.</p>`,
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "Italy",
      categories: {
        create: [{ categoryId: investmentPiecesCategory.id }],
      },
      media: {
        create: [{ assetId: mediaAssets[2].id, position: 1, isCover: true }],
      },
      variants: {
        create: [
          {
            sku: "MOD-DB-COAT-CAMEL-34",
            size: "34",
            color: "Camel",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 920,
          },
          {
            sku: "MOD-DB-COAT-CAMEL-36",
            size: "36",
            color: "Camel",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 945,
          },
          {
            sku: "MOD-DB-COAT-CAMEL-38",
            size: "38",
            color: "Camel",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 970,
          },
          {
            sku: "MOD-DB-COAT-CAMEL-40",
            size: "40",
            color: "Camel",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 995,
          },
        ],
      },
    },
  });

  // Product 14: Wrap Midi Dress
  const wrapDress = await prisma.product.create({
    data: {
      title: "Wrap Midi Dress",
      slug: "wrap-midi-dress",
      brand: "MODETT",
      shortDesc: "Elegant wrap dress with adjustable tie waist",
      longDescHtml: `<p>Versatile silhouette that flatters every body type.</p>`,
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "France",
      categories: {
        create: [{ categoryId: collectionsCategory.id }],
      },
      media: {
        create: [{ assetId: mediaAssets[3].id, position: 1, isCover: true }],
      },
      variants: {
        create: [
          {
            sku: "MOD-WRAP-DRESS-RUST-34",
            size: "34",
            color: "Rust",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 410,
          },
          {
            sku: "MOD-WRAP-DRESS-RUST-36",
            size: "36",
            color: "Rust",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 425,
          },
          {
            sku: "MOD-WRAP-DRESS-RUST-38",
            size: "38",
            color: "Rust",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 440,
          },
          {
            sku: "MOD-WRAP-DRESS-RUST-40",
            size: "40",
            color: "Rust",
            price: new Prisma.Decimal("1.00"),
            compareAtPrice: new Prisma.Decimal("3.00"),
            weightG: 455,
          },
        ],
      },
    },
  });

  // Product 15: Alpaca Blend Cardigan
  const alpacaCardigan = await prisma.product.create({
    data: {
      title: "Alpaca Blend Cardigan",
      slug: "alpaca-blend-cardigan",
      brand: "MODETT",
      shortDesc: "Luxuriously soft cardigan in alpaca wool blend",
      longDescHtml: `<p>Cozy yet refined. Perfect for layering through all seasons.</p>`,
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "Peru",
      categories: {
        create: [{ categoryId: newArrivalsCategory.id }],
      },
      media: {
        create: [{ assetId: mediaAssets[4].id, position: 1, isCover: true }],
      },
      variants: {
        create: [
          {
            sku: "MOD-ALPACA-CARD-OATMEAL-34",
            size: "34",
            color: "Oatmeal",
            price: new Prisma.Decimal("3.50"),
            compareAtPrice: new Prisma.Decimal("5.50"),
            weightG: 380,
          },
          {
            sku: "MOD-ALPACA-CARD-OATMEAL-36",
            size: "36",
            color: "Oatmeal",
            price: new Prisma.Decimal("3.50"),
            compareAtPrice: new Prisma.Decimal("5.50"),
            weightG: 395,
          },
          {
            sku: "MOD-ALPACA-CARD-OATMEAL-38",
            size: "38",
            color: "Oatmeal",
            price: new Prisma.Decimal("3.50"),
            compareAtPrice: new Prisma.Decimal("5.50"),
            weightG: 410,
          },
          {
            sku: "MOD-ALPACA-CARD-OATMEAL-40",
            size: "40",
            color: "Oatmeal",
            price: new Prisma.Decimal("3.50"),
            compareAtPrice: new Prisma.Decimal("5.50"),
            weightG: 425,
          },
        ],
      },
    },
  });

  // Product 16: A-Line Midi Skirt
  const aLineSkirt = await prisma.product.create({
    data: {
      title: "A-Line Midi Skirt",
      slug: "a-line-midi-skirt",
      brand: "MODETT",
      shortDesc: "Classic A-line silhouette in structured cotton",
      longDescHtml: `<p>Versatile midi skirt with flattering fit and feminine shape.</p>`,
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "Italy",
      categories: {
        create: [{ categoryId: investmentPiecesCategory.id }],
      },
      media: {
        create: [{ assetId: mediaAssets[5].id, position: 1, isCover: true }],
      },
      variants: {
        create: [
          {
            sku: "MOD-ALINE-SKIRT-BURGUNDY-34",
            size: "34",
            color: "Burgundy",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 320,
          },
          {
            sku: "MOD-ALINE-SKIRT-BURGUNDY-36",
            size: "36",
            color: "Burgundy",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 335,
          },
          {
            sku: "MOD-ALINE-SKIRT-BURGUNDY-38",
            size: "38",
            color: "Burgundy",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 350,
          },
          {
            sku: "MOD-ALINE-SKIRT-BURGUNDY-40",
            size: "40",
            color: "Burgundy",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 365,
          },
        ],
      },
    },
  });

  // Product 17: Satin Camisole
  const satinCami = await prisma.product.create({
    data: {
      title: "Satin Camisole",
      slug: "satin-camisole",
      brand: "MODETT",
      shortDesc: "Delicate satin camisole with lace trim details",
      longDescHtml: `<p>Elegant essential for layering or wearing alone.</p>`,
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "France",
      categories: {
        create: [{ categoryId: newArrivalsCategory.id }],
      },
      media: {
        create: [{ assetId: mediaAssets[6].id, position: 1, isCover: true }],
      },
      variants: {
        create: [
          {
            sku: "MOD-SATIN-CAMI-BLUSH-34",
            size: "34",
            color: "Blush",
            price: new Prisma.Decimal("2.00"),
            compareAtPrice: new Prisma.Decimal("4.00"),
            weightG: 120,
          },
          {
            sku: "MOD-SATIN-CAMI-BLUSH-36",
            size: "36",
            color: "Blush",
            price: new Prisma.Decimal("2.00"),
            compareAtPrice: new Prisma.Decimal("4.00"),
            weightG: 125,
          },
          {
            sku: "MOD-SATIN-CAMI-BLUSH-38",
            size: "38",
            color: "Blush",
            price: new Prisma.Decimal("2.00"),
            compareAtPrice: new Prisma.Decimal("4.00"),
            weightG: 130,
          },
          {
            sku: "MOD-SATIN-CAMI-BLUSH-40",
            size: "40",
            color: "Blush",
            price: new Prisma.Decimal("2.00"),
            compareAtPrice: new Prisma.Decimal("4.00"),
            weightG: 135,
          },
        ],
      },
    },
  });

  // Product 18: Tailored Culottes
  const tailoredCulottes = await prisma.product.create({
    data: {
      title: "Tailored Culottes",
      slug: "tailored-culottes",
      brand: "MODETT",
      shortDesc: "Modern culottes with precise tailoring",
      longDescHtml: `<p>Contemporary silhouette meets impeccable craftsmanship.</p>`,
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "Italy",
      categories: {
        create: [{ categoryId: collectionsCategory.id }],
      },
      media: {
        create: [{ assetId: mediaAssets[7].id, position: 1, isCover: true }],
      },
      variants: {
        create: [
          {
            sku: "MOD-CULOTTES-SLATE-34",
            size: "34",
            color: "Slate",
            price: new Prisma.Decimal("3.00"),
            compareAtPrice: new Prisma.Decimal("5.00"),
            weightG: 390,
          },
          {
            sku: "MOD-CULOTTES-SLATE-36",
            size: "36",
            color: "Slate",
            price: new Prisma.Decimal("3.00"),
            compareAtPrice: new Prisma.Decimal("5.00"),
            weightG: 405,
          },
          {
            sku: "MOD-CULOTTES-SLATE-38",
            size: "38",
            color: "Slate",
            price: new Prisma.Decimal("3.00"),
            compareAtPrice: new Prisma.Decimal("5.00"),
            weightG: 420,
          },
          {
            sku: "MOD-CULOTTES-SLATE-40",
            size: "40",
            color: "Slate",
            price: new Prisma.Decimal("3.00"),
            compareAtPrice: new Prisma.Decimal("5.00"),
            weightG: 435,
          },
        ],
      },
    },
  });

  // Product 19: Oversized Cotton Shirt
  const oversizedShirt = await prisma.product.create({
    data: {
      title: "Oversized Cotton Shirt",
      slug: "oversized-cotton-shirt",
      brand: "MODETT",
      shortDesc: "Relaxed fit shirt in premium organic cotton",
      longDescHtml: `<p>Effortless style in sustainable organic cotton.</p>`,
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "Portugal",
      categories: {
        create: [{ categoryId: investmentPiecesCategory.id }],
      },
      media: {
        create: [{ assetId: mediaAssets[8].id, position: 1, isCover: true }],
      },
      variants: {
        create: [
          {
            sku: "MOD-OVERSIZED-SHIRT-ECRU-34",
            size: "34",
            color: "Ecru",
            price: new Prisma.Decimal("2.00"),
            compareAtPrice: new Prisma.Decimal("4.00"),
            weightG: 220,
          },
          {
            sku: "MOD-OVERSIZED-SHIRT-ECRU-36",
            size: "36",
            color: "Ecru",
            price: new Prisma.Decimal("2.00"),
            compareAtPrice: new Prisma.Decimal("4.00"),
            weightG: 230,
          },
          {
            sku: "MOD-OVERSIZED-SHIRT-ECRU-38",
            size: "38",
            color: "Ecru",
            price: new Prisma.Decimal("2.00"),
            compareAtPrice: new Prisma.Decimal("4.00"),
            weightG: 240,
          },
          {
            sku: "MOD-OVERSIZED-SHIRT-ECRU-40",
            size: "40",
            color: "Ecru",
            price: new Prisma.Decimal("2.00"),
            compareAtPrice: new Prisma.Decimal("4.00"),
            weightG: 250,
          },
        ],
      },
    },
  });

  // Product 20: Ribbed Knit Dress
  const ribbedDress = await prisma.product.create({
    data: {
      title: "Ribbed Knit Dress",
      slug: "ribbed-knit-dress",
      brand: "MODETT",
      shortDesc: "Figure-hugging ribbed knit in soft merino",
      longDescHtml: `<p>Sophisticated knitwear that moves with you.</p>`,
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "Italy",
      categories: {
        create: [{ categoryId: newArrivalsCategory.id }],
      },
      media: {
        create: [{ assetId: mediaAssets[9].id, position: 1, isCover: true }],
      },
      variants: {
        create: [
          {
            sku: "MOD-RIBBED-DRESS-MOCHA-34",
            size: "34",
            color: "Mocha",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 340,
          },
          {
            sku: "MOD-RIBBED-DRESS-MOCHA-36",
            size: "36",
            color: "Mocha",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 355,
          },
          {
            sku: "MOD-RIBBED-DRESS-MOCHA-38",
            size: "38",
            color: "Mocha",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 370,
          },
          {
            sku: "MOD-RIBBED-DRESS-MOCHA-40",
            size: "40",
            color: "Mocha",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 385,
          },
        ],
      },
    },
  });

  // Product 21: Belted Trench Coat
  const trenchCoat = await prisma.product.create({
    data: {
      title: "Belted Trench Coat",
      slug: "belted-trench-coat",
      brand: "MODETT",
      shortDesc: "Classic trench coat with modern updates",
      longDescHtml: `<p>Timeless outerwear reimagined for the contemporary wardrobe.</p>`,
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "UK",
      categories: {
        create: [{ categoryId: investmentPiecesCategory.id }],
      },
      media: {
        create: [{ assetId: mediaAssets[0].id, position: 1, isCover: true }],
      },
      variants: {
        create: [
          {
            sku: "MOD-TRENCH-STONE-34",
            size: "34",
            color: "Stone",
            price: new Prisma.Decimal("4.00"),
            compareAtPrice: new Prisma.Decimal("6.00"),
            weightG: 850,
          },
          {
            sku: "MOD-TRENCH-STONE-36",
            size: "36",
            color: "Stone",
            price: new Prisma.Decimal("4.00"),
            compareAtPrice: new Prisma.Decimal("6.00"),
            weightG: 875,
          },
          {
            sku: "MOD-TRENCH-STONE-38",
            size: "38",
            color: "Stone",
            price: new Prisma.Decimal("4.00"),
            compareAtPrice: new Prisma.Decimal("6.00"),
            weightG: 900,
          },
          {
            sku: "MOD-TRENCH-STONE-40",
            size: "40",
            color: "Stone",
            price: new Prisma.Decimal("4.00"),
            compareAtPrice: new Prisma.Decimal("6.00"),
            weightG: 925,
          },
        ],
      },
    },
  });

  // Product 22: High-Waisted Jeans
  const highWaistedJeans = await prisma.product.create({
    data: {
      title: "High-Waisted Jeans",
      slug: "high-waisted-jeans",
      brand: "MODETT",
      shortDesc: "Premium denim with vintage-inspired fit",
      longDescHtml: `<p>Modern essential in premium Japanese denim.</p>`,
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "Japan",
      categories: {
        create: [{ categoryId: collectionsCategory.id }],
      },
      media: {
        create: [{ assetId: mediaAssets[1].id, position: 1, isCover: true }],
      },
      variants: {
        create: [
          {
            sku: "MOD-JEANS-INDIGO-34",
            size: "34",
            color: "Indigo",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 480,
          },
          {
            sku: "MOD-JEANS-INDIGO-36",
            size: "36",
            color: "Indigo",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 495,
          },
          {
            sku: "MOD-JEANS-INDIGO-38",
            size: "38",
            color: "Indigo",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 510,
          },
          {
            sku: "MOD-JEANS-INDIGO-40",
            size: "40",
            color: "Indigo",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 525,
          },
        ],
      },
    },
  });

  // Product 23: Structured Leather Jacket
  const leatherJacket = await prisma.product.create({
    data: {
      title: "Structured Leather Jacket",
      slug: "structured-leather-jacket",
      brand: "MODETT",
      shortDesc: "Premium leather jacket with modern silhouette",
      longDescHtml: `<p>Investment outerwear in buttery soft Italian leather.</p>`,
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "Italy",
      categories: {
        create: [{ categoryId: investmentPiecesCategory.id }],
      },
      media: {
        create: [{ assetId: mediaAssets[2].id, position: 1, isCover: true }],
      },
      variants: {
        create: [
          {
            sku: "MOD-LEATHER-JKT-BLACK-34",
            size: "34",
            color: "Black",
            price: new Prisma.Decimal("5.00"),
            compareAtPrice: new Prisma.Decimal("6.00"),
            weightG: 980,
          },
          {
            sku: "MOD-LEATHER-JKT-BLACK-36",
            size: "36",
            color: "Black",
            price: new Prisma.Decimal("5.00"),
            compareAtPrice: new Prisma.Decimal("6.00"),
            weightG: 1005,
          },
          {
            sku: "MOD-LEATHER-JKT-BLACK-38",
            size: "38",
            color: "Black",
            price: new Prisma.Decimal("5.00"),
            compareAtPrice: new Prisma.Decimal("6.00"),
            weightG: 1030,
          },
          {
            sku: "MOD-LEATHER-JKT-BLACK-40",
            size: "40",
            color: "Black",
            price: new Prisma.Decimal("5.00"),
            compareAtPrice: new Prisma.Decimal("6.00"),
            weightG: 1055,
          },
        ],
      },
    },
  });

  // Product 24: Tiered Maxi Skirt
  const tieredSkirt = await prisma.product.create({
    data: {
      title: "Tiered Maxi Skirt",
      slug: "tiered-maxi-skirt",
      brand: "MODETT",
      shortDesc: "Flowing tiered skirt with romantic silhouette",
      longDescHtml: `<p>Bohemian elegance in premium cotton voile.</p>`,
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "India",
      categories: {
        create: [{ categoryId: collectionsCategory.id }],
      },
      media: {
        create: [{ assetId: mediaAssets[3].id, position: 1, isCover: true }],
      },
      variants: {
        create: [
          {
            sku: "MOD-TIERED-SKIRT-SAGE-34",
            size: "34",
            color: "Sage",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 310,
          },
          {
            sku: "MOD-TIERED-SKIRT-SAGE-36",
            size: "36",
            color: "Sage",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 325,
          },
          {
            sku: "MOD-TIERED-SKIRT-SAGE-38",
            size: "38",
            color: "Sage",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 340,
          },
          {
            sku: "MOD-TIERED-SKIRT-SAGE-40",
            size: "40",
            color: "Sage",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 355,
          },
        ],
      },
    },
  });

  // Product 25: Cable Knit Sweater
  const cableKnit = await prisma.product.create({
    data: {
      title: "Cable Knit Sweater",
      slug: "cable-knit-sweater",
      brand: "MODETT",
      shortDesc: "Traditional cable knit in organic wool",
      longDescHtml: `<p>Heritage knitwear crafted with modern sensibility.</p>`,
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "Ireland",
      categories: {
        create: [{ categoryId: newArrivalsCategory.id }],
      },
      media: {
        create: [{ assetId: mediaAssets[4].id, position: 1, isCover: true }],
      },
      variants: {
        create: [
          {
            sku: "MOD-CABLE-SWEATER-CREAM-34",
            size: "34",
            color: "Cream",
            price: new Prisma.Decimal("3.00"),
            compareAtPrice: new Prisma.Decimal("5.00"),
            weightG: 450,
          },
          {
            sku: "MOD-CABLE-SWEATER-CREAM-36",
            size: "36",
            color: "Cream",
            price: new Prisma.Decimal("3.00"),
            compareAtPrice: new Prisma.Decimal("5.00"),
            weightG: 465,
          },
          {
            sku: "MOD-CABLE-SWEATER-CREAM-38",
            size: "38",
            color: "Cream",
            price: new Prisma.Decimal("3.00"),
            compareAtPrice: new Prisma.Decimal("5.00"),
            weightG: 480,
          },
          {
            sku: "MOD-CABLE-SWEATER-CREAM-40",
            size: "40",
            color: "Cream",
            price: new Prisma.Decimal("3.00"),
            compareAtPrice: new Prisma.Decimal("5.00"),
            weightG: 495,
          },
        ],
      },
    },
  });

  // Product 26: Asymmetric Hem Skirt
  const asymmetricSkirt = await prisma.product.create({
    data: {
      title: "Asymmetric Hem Skirt",
      slug: "asymmetric-hem-skirt",
      brand: "MODETT",
      shortDesc: "Contemporary skirt with asymmetric hemline",
      longDescHtml: `<p>Modern design meets elegant draping.</p>`,
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "France",
      categories: {
        create: [{ categoryId: investmentPiecesCategory.id }],
      },
      media: {
        create: [{ assetId: mediaAssets[5].id, position: 1, isCover: true }],
      },
      variants: {
        create: [
          {
            sku: "MOD-ASYM-SKIRT-PLUM-34",
            size: "34",
            color: "Plum",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 290,
          },
          {
            sku: "MOD-ASYM-SKIRT-PLUM-36",
            size: "36",
            color: "Plum",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 305,
          },
          {
            sku: "MOD-ASYM-SKIRT-PLUM-38",
            size: "38",
            color: "Plum",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 320,
          },
          {
            sku: "MOD-ASYM-SKIRT-PLUM-40",
            size: "40",
            color: "Plum",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 335,
          },
        ],
      },
    },
  });

  // Product 27: Draped Blouse
  const drapedBlouse = await prisma.product.create({
    data: {
      title: "Draped Blouse",
      slug: "draped-blouse",
      brand: "MODETT",
      shortDesc: "Elegant blouse with draped neckline",
      longDescHtml: `<p>Sophisticated draping in luxurious silk satin.</p>`,
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "France",
      categories: {
        create: [{ categoryId: newArrivalsCategory.id }],
      },
      media: {
        create: [{ assetId: mediaAssets[6].id, position: 1, isCover: true }],
      },
      variants: {
        create: [
          {
            sku: "MOD-DRAPED-BLOUSE-PEARL-34",
            size: "34",
            color: "Pearl",
            price: new Prisma.Decimal("3.00"),
            compareAtPrice: new Prisma.Decimal("5.00"),
            weightG: 180,
          },
          {
            sku: "MOD-DRAPED-BLOUSE-PEARL-36",
            size: "36",
            color: "Pearl",
            price: new Prisma.Decimal("3.00"),
            compareAtPrice: new Prisma.Decimal("5.00"),
            weightG: 190,
          },
          {
            sku: "MOD-DRAPED-BLOUSE-PEARL-38",
            size: "38",
            color: "Pearl",
            price: new Prisma.Decimal("3.00"),
            compareAtPrice: new Prisma.Decimal("5.00"),
            weightG: 200,
          },
          {
            sku: "MOD-DRAPED-BLOUSE-PEARL-40",
            size: "40",
            color: "Pearl",
            price: new Prisma.Decimal("3.00"),
            compareAtPrice: new Prisma.Decimal("5.00"),
            weightG: 210,
          },
        ],
      },
    },
  });

  // Product 28: Straight Leg Pants
  const straightPants = await prisma.product.create({
    data: {
      title: "Straight Leg Pants",
      slug: "straight-leg-pants",
      brand: "MODETT",
      shortDesc: "Classic straight leg in stretch wool",
      longDescHtml: `<p>Versatile tailoring that works for every occasion.</p>`,
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "Italy",
      categories: {
        create: [{ categoryId: collectionsCategory.id }],
      },
      media: {
        create: [{ assetId: mediaAssets[7].id, position: 1, isCover: true }],
      },
      variants: {
        create: [
          {
            sku: "MOD-STRAIGHT-PANTS-GRAPHITE-34",
            size: "34",
            color: "Graphite",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 370,
          },
          {
            sku: "MOD-STRAIGHT-PANTS-GRAPHITE-36",
            size: "36",
            color: "Graphite",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 385,
          },
          {
            sku: "MOD-STRAIGHT-PANTS-GRAPHITE-38",
            size: "38",
            color: "Graphite",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 400,
          },
          {
            sku: "MOD-STRAIGHT-PANTS-GRAPHITE-40",
            size: "40",
            color: "Graphite",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 415,
          },
        ],
      },
    },
  });

  // Product 29: Mandarin Collar Shirt
  const mandarinShirt = await prisma.product.create({
    data: {
      title: "Mandarin Collar Shirt",
      slug: "mandarin-collar-shirt",
      brand: "MODETT",
      shortDesc: "Minimalist shirt with mandarin collar",
      longDescHtml: `<p>Contemporary silhouette in crisp linen blend.</p>`,
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "Portugal",
      categories: {
        create: [{ categoryId: investmentPiecesCategory.id }],
      },
      media: {
        create: [{ assetId: mediaAssets[8].id, position: 1, isCover: true }],
      },
      variants: {
        create: [
          {
            sku: "MOD-MANDARIN-SHIRT-MINT-34",
            size: "34",
            color: "Mint",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.00"),
            weightG: 210,
          },
          {
            sku: "MOD-MANDARIN-SHIRT-MINT-36",
            size: "36",
            color: "Mint",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.00"),
            weightG: 220,
          },
          {
            sku: "MOD-MANDARIN-SHIRT-MINT-38",
            size: "38",
            color: "Mint",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.00"),
            weightG: 230,
          },
          {
            sku: "MOD-MANDARIN-SHIRT-MINT-40",
            size: "40",
            color: "Mint",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.00"),
            weightG: 240,
          },
        ],
      },
    },
  });

  // Product 30: Mock Neck Sweater
  const mockNeckSweater = await prisma.product.create({
    data: {
      title: "Mock Neck Sweater",
      slug: "mock-neck-sweater",
      brand: "MODETT",
      shortDesc: "Refined mock neck in lightweight cashmere",
      longDescHtml: `<p>Luxurious layering piece in pure cashmere.</p>`,
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "Scotland",
      categories: {
        create: [{ categoryId: newArrivalsCategory.id }],
      },
      media: {
        create: [{ assetId: mediaAssets[9].id, position: 1, isCover: true }],
      },
      variants: {
        create: [
          {
            sku: "MOD-MOCK-SWEATER-TAUPE-34",
            size: "34",
            color: "Taupe",
            price: new Prisma.Decimal("3.00"),
            compareAtPrice: new Prisma.Decimal("5.00"),
            weightG: 260,
          },
          {
            sku: "MOD-MOCK-SWEATER-TAUPE-36",
            size: "36",
            color: "Taupe",
            price: new Prisma.Decimal("3.00"),
            compareAtPrice: new Prisma.Decimal("5.00"),
            weightG: 270,
          },
          {
            sku: "MOD-MOCK-SWEATER-TAUPE-38",
            size: "38",
            color: "Taupe",
            price: new Prisma.Decimal("3.00"),
            compareAtPrice: new Prisma.Decimal("5.00"),
            weightG: 280,
          },
          {
            sku: "MOD-MOCK-SWEATER-TAUPE-40",
            size: "40",
            color: "Taupe",
            price: new Prisma.Decimal("3.00"),
            compareAtPrice: new Prisma.Decimal("5.00"),
            weightG: 290,
          },
        ],
      },
    },
  });

  // Product 31: Pencil Skirt
  const pencilSkirt = await prisma.product.create({
    data: {
      title: "Pencil Skirt",
      slug: "pencil-skirt",
      brand: "MODETT",
      shortDesc: "Classic pencil silhouette in Italian wool",
      longDescHtml: `<p>Timeless elegance with modern fit.</p>`,
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "Italy",
      categories: {
        create: [{ categoryId: investmentPiecesCategory.id }],
      },
      media: {
        create: [{ assetId: mediaAssets[0].id, position: 1, isCover: true }],
      },
      variants: {
        create: [
          {
            sku: "MOD-PENCIL-SKIRT-NAVY-34",
            size: "34",
            color: "Navy",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 330,
          },
          {
            sku: "MOD-PENCIL-SKIRT-NAVY-36",
            size: "36",
            color: "Navy",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 345,
          },
          {
            sku: "MOD-PENCIL-SKIRT-NAVY-38",
            size: "38",
            color: "Navy",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 360,
          },
          {
            sku: "MOD-PENCIL-SKIRT-NAVY-40",
            size: "40",
            color: "Navy",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 375,
          },
        ],
      },
    },
  });

  // Product 32: Relaxed Linen Pants
  const linenPants = await prisma.product.create({
    data: {
      title: "Relaxed Linen Pants",
      slug: "relaxed-linen-pants",
      brand: "MODETT",
      shortDesc: "Easy-fit linen pants for effortless style",
      longDescHtml: `<p>Breathable comfort in premium European linen.</p>`,
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "Portugal",
      categories: {
        create: [{ categoryId: collectionsCategory.id }],
      },
      media: {
        create: [{ assetId: mediaAssets[1].id, position: 1, isCover: true }],
      },
      variants: {
        create: [
          {
            sku: "MOD-LINEN-PANTS-SAND-34",
            size: "34",
            color: "Sand",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 310,
          },
          {
            sku: "MOD-LINEN-PANTS-SAND-36",
            size: "36",
            color: "Sand",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 325,
          },
          {
            sku: "MOD-LINEN-PANTS-SAND-38",
            size: "38",
            color: "Sand",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 340,
          },
          {
            sku: "MOD-LINEN-PANTS-SAND-40",
            size: "40",
            color: "Sand",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 355,
          },
        ],
      },
    },
  });

  // Product 33: Cropped Blazer
  const croppedBlazer = await prisma.product.create({
    data: {
      title: "Cropped Blazer",
      slug: "cropped-blazer",
      brand: "MODETT",
      shortDesc: "Modern cropped blazer with structured shoulders",
      longDescHtml: `<p>Contemporary tailoring with feminine proportions.</p>`,
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "Italy",
      categories: {
        create: [{ categoryId: newArrivalsCategory.id }],
      },
      media: {
        create: [{ assetId: mediaAssets[2].id, position: 1, isCover: true }],
      },
      variants: {
        create: [
          {
            sku: "MOD-CROP-BLAZER-IVORY-34",
            size: "34",
            color: "Ivory",
            price: new Prisma.Decimal("3.50"),
            compareAtPrice: new Prisma.Decimal("5.50"),
            weightG: 540,
          },
          {
            sku: "MOD-CROP-BLAZER-IVORY-36",
            size: "36",
            color: "Ivory",
            price: new Prisma.Decimal("3.50"),
            compareAtPrice: new Prisma.Decimal("5.50"),
            weightG: 555,
          },
          {
            sku: "MOD-CROP-BLAZER-IVORY-38",
            size: "38",
            color: "Ivory",
            price: new Prisma.Decimal("3.50"),
            compareAtPrice: new Prisma.Decimal("5.50"),
            weightG: 570,
          },
          {
            sku: "MOD-CROP-BLAZER-IVORY-40",
            size: "40",
            color: "Ivory",
            price: new Prisma.Decimal("3.50"),
            compareAtPrice: new Prisma.Decimal("5.50"),
            weightG: 585,
          },
        ],
      },
    },
  });

  // Product 34: Shirt Dress
  const shirtDress = await prisma.product.create({
    data: {
      title: "Shirt Dress",
      slug: "shirt-dress",
      brand: "MODETT",
      shortDesc: "Versatile shirt dress in organic cotton",
      longDescHtml: `<p>Effortless elegance in sustainable cotton.</p>`,
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "Turkey",
      categories: {
        create: [{ categoryId: collectionsCategory.id }],
      },
      media: {
        create: [{ assetId: mediaAssets[3].id, position: 1, isCover: true }],
      },
      variants: {
        create: [
          {
            sku: "MOD-SHIRT-DRESS-OLIVE-34",
            size: "34",
            color: "Olive",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 360,
          },
          {
            sku: "MOD-SHIRT-DRESS-OLIVE-36",
            size: "36",
            color: "Olive",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 375,
          },
          {
            sku: "MOD-SHIRT-DRESS-OLIVE-38",
            size: "38",
            color: "Olive",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 390,
          },
          {
            sku: "MOD-SHIRT-DRESS-OLIVE-40",
            size: "40",
            color: "Olive",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 405,
          },
        ],
      },
    },
  });

  // Product 35: Mohair Blend Sweater
  const mohairSweater = await prisma.product.create({
    data: {
      title: "Mohair Blend Sweater",
      slug: "mohair-blend-sweater",
      brand: "MODETT",
      shortDesc: "Soft and fuzzy mohair blend pullover",
      longDescHtml: `<p>Cloud-like softness in brushed mohair.</p>`,
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "France",
      categories: {
        create: [{ categoryId: investmentPiecesCategory.id }],
      },
      media: {
        create: [{ assetId: mediaAssets[4].id, position: 1, isCover: true }],
      },
      variants: {
        create: [
          {
            sku: "MOD-MOHAIR-SWEATER-DUSTYROSE-34",
            size: "34",
            color: "Dusty Rose",
            price: new Prisma.Decimal("3.00"),
            compareAtPrice: new Prisma.Decimal("5.00"),
            weightG: 300,
          },
          {
            sku: "MOD-MOHAIR-SWEATER-DUSTYROSE-36",
            size: "36",
            color: "Dusty Rose",
            price: new Prisma.Decimal("3.00"),
            compareAtPrice: new Prisma.Decimal("5.00"),
            weightG: 315,
          },
          {
            sku: "MOD-MOHAIR-SWEATER-DUSTYROSE-38",
            size: "38",
            color: "Dusty Rose",
            price: new Prisma.Decimal("3.00"),
            compareAtPrice: new Prisma.Decimal("5.00"),
            weightG: 330,
          },
          {
            sku: "MOD-MOHAIR-SWEATER-DUSTYROSE-40",
            size: "40",
            color: "Dusty Rose",
            price: new Prisma.Decimal("3.00"),
            compareAtPrice: new Prisma.Decimal("5.00"),
            weightG: 345,
          },
        ],
      },
    },
  });

  // Product 36: Accordion Pleat Skirt
  const accordionSkirt = await prisma.product.create({
    data: {
      title: "Accordion Pleat Skirt",
      slug: "accordion-pleat-skirt",
      brand: "MODETT",
      shortDesc: "Delicate accordion pleats in flowing fabric",
      longDescHtml: `<p>Graceful movement in every step.</p>`,
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "France",
      categories: {
        create: [{ categoryId: newArrivalsCategory.id }],
      },
      media: {
        create: [{ assetId: mediaAssets[5].id, position: 1, isCover: true }],
      },
      variants: {
        create: [
          {
            sku: "MOD-ACCORDION-SKIRT-EMERALD-34",
            size: "34",
            color: "Emerald",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 300,
          },
          {
            sku: "MOD-ACCORDION-SKIRT-EMERALD-36",
            size: "36",
            color: "Emerald",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 315,
          },
          {
            sku: "MOD-ACCORDION-SKIRT-EMERALD-38",
            size: "38",
            color: "Emerald",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 330,
          },
          {
            sku: "MOD-ACCORDION-SKIRT-EMERALD-40",
            size: "40",
            color: "Emerald",
            price: new Prisma.Decimal("2.50"),
            compareAtPrice: new Prisma.Decimal("4.50"),
            weightG: 345,
          },
        ],
      },
    },
  });

  // Product 37: Halter Neck Top
  const halterTop = await prisma.product.create({
    data: {
      title: "Halter Neck Top",
      slug: "halter-neck-top",
      brand: "MODETT",
      shortDesc: "Elegant halter top in silk blend",
      longDescHtml: `<p>Sophisticated summer essential.</p>`,
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "Italy",
      categories: {
        create: [{ categoryId: collectionsCategory.id }],
      },
      media: {
        create: [{ assetId: mediaAssets[6].id, position: 1, isCover: true }],
      },
      variants: {
        create: [
          {
            sku: "MOD-HALTER-TOP-SILVER-34",
            size: "34",
            color: "Silver",
            price: new Prisma.Decimal("2.00"),
            compareAtPrice: new Prisma.Decimal("4.00"),
            weightG: 140,
          },
          {
            sku: "MOD-HALTER-TOP-SILVER-36",
            size: "36",
            color: "Silver",
            price: new Prisma.Decimal("2.00"),
            compareAtPrice: new Prisma.Decimal("4.00"),
            weightG: 145,
          },
          {
            sku: "MOD-HALTER-TOP-SILVER-38",
            size: "38",
            color: "Silver",
            price: new Prisma.Decimal("2.00"),
            compareAtPrice: new Prisma.Decimal("4.00"),
            weightG: 150,
          },
          {
            sku: "MOD-HALTER-TOP-SILVER-40",
            size: "40",
            color: "Silver",
            price: new Prisma.Decimal("2.00"),
            compareAtPrice: new Prisma.Decimal("4.00"),
            weightG: 155,
          },
        ],
      },
    },
  });

  // Product 38: Paper Bag Waist Pants
  const paperBagPants = await prisma.product.create({
    data: {
      title: "Paper Bag Waist Pants",
      slug: "paper-bag-waist-pants",
      brand: "MODETT",
      shortDesc: "High-waisted pants with paper bag waist detail",
      longDescHtml: `<p>Contemporary silhouette with flattering fit.</p>`,
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "Portugal",
      categories: {
        create: [{ categoryId: investmentPiecesCategory.id }],
      },
      media: {
        create: [{ assetId: mediaAssets[7].id, position: 1, isCover: true }],
      },
      variants: {
        create: [
          {
            sku: "MOD-PAPER-PANTS-CARAMEL-34",
            size: "34",
            color: "Caramel",
            price: new Prisma.Decimal("3.00"),
            compareAtPrice: new Prisma.Decimal("5.00"),
            weightG: 360,
          },
          {
            sku: "MOD-PAPER-PANTS-CARAMEL-36",
            size: "36",
            color: "Caramel",
            price: new Prisma.Decimal("3.00"),
            compareAtPrice: new Prisma.Decimal("5.00"),
            weightG: 375,
          },
          {
            sku: "MOD-PAPER-PANTS-CARAMEL-38",
            size: "38",
            color: "Caramel",
            price: new Prisma.Decimal("3.00"),
            compareAtPrice: new Prisma.Decimal("5.00"),
            weightG: 390,
          },
          {
            sku: "MOD-PAPER-PANTS-CARAMEL-40",
            size: "40",
            color: "Caramel",
            price: new Prisma.Decimal("3.00"),
            compareAtPrice: new Prisma.Decimal("5.00"),
            weightG: 405,
          },
        ],
      },
    },
  });

  // Product 39: Henley Top
  const henleyTop = await prisma.product.create({
    data: {
      title: "Henley Top",
      slug: "henley-top",
      brand: "MODETT",
      shortDesc: "Classic henley in organic cotton",
      longDescHtml: `<p>Casual sophistication in soft organic cotton.</p>`,
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "Portugal",
      categories: {
        create: [{ categoryId: newArrivalsCategory.id }],
      },
      media: {
        create: [{ assetId: mediaAssets[8].id, position: 1, isCover: true }],
      },
      variants: {
        create: [
          {
            sku: "MOD-HENLEY-LAVENDER-34",
            size: "34",
            color: "Lavender",
            price: new Prisma.Decimal("2.00"),
            compareAtPrice: new Prisma.Decimal("4.00"),
            weightG: 190,
          },
          {
            sku: "MOD-HENLEY-LAVENDER-36",
            size: "36",
            color: "Lavender",
            price: new Prisma.Decimal("2.00"),
            compareAtPrice: new Prisma.Decimal("4.00"),
            weightG: 200,
          },
          {
            sku: "MOD-HENLEY-LAVENDER-38",
            size: "38",
            color: "Lavender",
            price: new Prisma.Decimal("2.00"),
            compareAtPrice: new Prisma.Decimal("4.00"),
            weightG: 210,
          },
          {
            sku: "MOD-HENLEY-LAVENDER-40",
            size: "40",
            color: "Lavender",
            price: new Prisma.Decimal("2.00"),
            compareAtPrice: new Prisma.Decimal("4.00"),
            weightG: 220,
          },
        ],
      },
    },
  });

  // Product 40: V-Neck Knit Vest
  const knitVest = await prisma.product.create({
    data: {
      title: "V-Neck Knit Vest",
      slug: "v-neck-knit-vest",
      brand: "MODETT",
      shortDesc: "Sleeveless knit vest for versatile layering",
      longDescHtml: `<p>Essential layering piece in fine merino.</p>`,
      status: "published",
      publishAt: new Date(),
      countryOfOrigin: "Italy",
      categories: {
        create: [{ categoryId: collectionsCategory.id }],
      },
      media: {
        create: [{ assetId: mediaAssets[9].id, position: 1, isCover: true }],
      },
      variants: {
        create: [
          {
            sku: "MOD-KNIT-VEST-CHARCOAL-34",
            size: "34",
            color: "Charcoal",
            price: new Prisma.Decimal("2.00"),
            compareAtPrice: new Prisma.Decimal("4.00"),
            weightG: 200,
          },
          {
            sku: "MOD-KNIT-VEST-CHARCOAL-36",
            size: "36",
            color: "Charcoal",
            price: new Prisma.Decimal("2.00"),
            compareAtPrice: new Prisma.Decimal("4.00"),
            weightG: 210,
          },
          {
            sku: "MOD-KNIT-VEST-CHARCOAL-38",
            size: "38",
            color: "Charcoal",
            price: new Prisma.Decimal("2.00"),
            compareAtPrice: new Prisma.Decimal("4.00"),
            weightG: 220,
          },
          {
            sku: "MOD-KNIT-VEST-CHARCOAL-40",
            size: "40",
            color: "Charcoal",
            price: new Prisma.Decimal("2.00"),
            compareAtPrice: new Prisma.Decimal("4.00"),
            weightG: 230,
          },
        ],
      },
    },
  });

  console.log(`✅ Created 40 products with variants`);

  // 5. Create inventory stock for all variants
  console.log("📊 Creating inventory stock...");

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
  console.log(
    `✅ Created inventory stock for ${allVariants.length} variants at Main Warehouse`,
  );

  // 6. Create admin user for testing
  console.log("👤 Creating admin user...");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@modett.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!@#";

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  let adminUser;
  if (existingAdmin) {
    console.log(`⚠️  Admin user already exists: ${adminEmail}`);
    adminUser = existingAdmin;
  } else {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: hashedPassword,
        role: "ADMIN",
        status: "active",
        emailVerified: true,
        isGuest: false,
      },
    });

    console.log(`✅ Created admin user: ${adminEmail}`);
    if (process.env.NODE_ENV !== "production") {
      console.log(`   Password: ${adminPassword}`);
      console.log(`   ⚠️  Please change this password in production!`);
    }
  }

  // Summary
  console.log("\n📊 Seed Summary:");
  console.log(`   Admin User: ${adminUser.email} (${adminUser.role})`);
  console.log(`   Warehouse: 1 (Main Warehouse)`);
  console.log(
    `   Categories: 3 (Investment Pieces, New Arrivals, Collections)`,
  );
  console.log(
    `   Media Assets: ${mediaAssets.length} (high-quality product images)`,
  );
  console.log(`   Products: 40 (cycling through ${mediaAssets.length} images)`);
  console.log(`   Variants: ${allVariants.length} (4 sizes per product)`);
  console.log(
    `   Inventory Records: ${allVariants.length} (all at Main Warehouse)`,
  );
  console.log("\n✅ Seed completed successfully!");
  // 7. Seed System Settings
  console.log("⚙️  Seeding System Settings...");
  const settings = [
    // General
    {
      group: "general",
      key: "store_name",
      value: "MODETT",
      type: "string",
      isPublic: true,
    },
    {
      group: "general",
      key: "support_email",
      value: "support@modett.com",
      type: "string",
      isPublic: true,
    },
    {
      group: "general",
      key: "support_phone",
      value: "+94 77 123 4567",
      type: "string",
      isPublic: true,
    },
    {
      group: "general",
      key: "currency",
      value: "LKR",
      type: "string",
      isPublic: true,
    },
    {
      group: "general",
      key: "social_links",
      value: JSON.stringify({
        instagram: "https://instagram.com/modett",
        facebook: "https://facebook.com/modett",
      }),
      type: "json",
      isPublic: true,
    },

    // Shipping (Business Rules)
    {
      group: "shipping",
      key: "shipping_rate_colombo",
      value: "3.0",
      type: "number",
      isPublic: true,
    },
    {
      group: "shipping",
      key: "shipping_rate_suburbs",
      value: "3.0",
      type: "number",
      isPublic: true,
    }, // Changed from 3.0 to match recent fix
    {
      group: "shipping",
      key: "free_shipping_threshold",
      value: "5000",
      type: "number",
      isPublic: true,
    },

    // Appearance (Marketing)
    {
      group: "appearance",
      key: "announcement_enabled",
      value: "true",
      type: "boolean",
      isPublic: true,
    },
    {
      group: "appearance",
      key: "announcement_text",
      value: "Free Shipping on orders over Rs. 5,000",
      type: "string",
      isPublic: true,
    },
    {
      group: "appearance",
      key: "announcement_link",
      value: "/collections/new-arrivals",
      type: "string",
      isPublic: true,
    },
    {
      group: "appearance",
      key: "announcement_bg_color",
      value: "#000000",
      type: "string",
      isPublic: true,
    },

    // Inventory
    {
      group: "inventory",
      key: "low_stock_threshold",
      value: "5",
      type: "number",
      isPublic: false,
    },
  ];

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {}, // Don't overwrite if exists
      create: {
        group: setting.group,
        key: setting.key,
        value: setting.value,
        type: setting.type,
        isPublic: setting.isPublic,
      },
    });
  }
  console.log(`✅ Seeded ${settings.length} system settings`);

  console.log("🌱 Seed completed successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
