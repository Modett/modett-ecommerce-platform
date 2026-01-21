import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("⚙️  Seeding System Settings Only...");
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
    },
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
    {
      group: "appearance",
      key: "announcement_text_color",
      value: "#FFFFFF",
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
      update: {},
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
