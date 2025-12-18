import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// New Sri Lankan warehouse location
const NEW_WAREHOUSE_ID = '1952ab34-eda8-4485-89e4-302bc2b8b5b9';

async function migrateToSriLankaWarehouse() {
  try {
    console.log('🇱🇰 Starting migration to Sri Lanka Warehouse...\n');

    // Step 1: Get all old warehouse locations
    const oldWarehouses = await prisma.location.findMany({
      where: {
        NOT: {
          id: NEW_WAREHOUSE_ID
        }
      }
    });

    console.log(`Found ${oldWarehouses.length} old warehouse(s) to migrate from:\n`);
    oldWarehouses.forEach((wh, idx) => {
      console.log(`  ${idx + 1}. ${wh.name} (${wh.id})`);
    });
    console.log('');

    // Step 2: Migrate inventory stocks
    console.log('📦 Migrating inventory stocks...');
    for (const oldWarehouse of oldWarehouses) {
      const result = await prisma.$executeRaw`
        UPDATE "inventory_management"."inventory_stocks"
        SET "location_id" = ${NEW_WAREHOUSE_ID}::uuid
        WHERE "location_id" = ${oldWarehouse.id}::uuid
      `;
      console.log(`  ✅ Migrated ${result} stock records from ${oldWarehouse.name}`);
    }

    // Step 3: Migrate inventory transactions
    console.log('\n📊 Migrating inventory transactions...');
    for (const oldWarehouse of oldWarehouses) {
      const result = await prisma.$executeRaw`
        UPDATE "inventory_management"."inventory_transactions"
        SET "location_id" = ${NEW_WAREHOUSE_ID}::uuid
        WHERE "location_id" = ${oldWarehouse.id}::uuid
      `;
      console.log(`  ✅ Migrated ${result} transaction records from ${oldWarehouse.name}`);
    }

    // Step 4: Migrate pickup reservations
    console.log('\n🚚 Migrating pickup reservations...');
    for (const oldWarehouse of oldWarehouses) {
      const result = await prisma.$executeRaw`
        UPDATE "inventory_management"."pickup_reservations"
        SET "location_id" = ${NEW_WAREHOUSE_ID}::uuid
        WHERE "location_id" = ${oldWarehouse.id}::uuid
      `;
      console.log(`  ✅ Migrated ${result} pickup reservation records from ${oldWarehouse.name}`);
    }

    // Step 5: Migrate appointments
    console.log('\n📅 Migrating appointments...');
    for (const oldWarehouse of oldWarehouses) {
      const result = await prisma.$executeRaw`
        UPDATE "engagement"."appointments"
        SET "location_id" = ${NEW_WAREHOUSE_ID}::uuid
        WHERE "location_id" = ${oldWarehouse.id}::uuid
      `;
      console.log(`  ✅ Migrated ${result} appointment records from ${oldWarehouse.name}`);
    }

    // Step 6: Migrate order shipments
    console.log('\n📮 Migrating order shipments...');
    for (const oldWarehouse of oldWarehouses) {
      const result = await prisma.$executeRaw`
        UPDATE "order_management"."order_shipments"
        SET "pickup_location_id" = ${NEW_WAREHOUSE_ID}::uuid
        WHERE "pickup_location_id" = ${oldWarehouse.id}::uuid
      `;
      console.log(`  ✅ Migrated ${result} shipment records from ${oldWarehouse.name}`);
    }

    // Step 7: Delete old warehouse locations
    if (oldWarehouses.length > 0) {
      console.log('\n🗑️  Deleting old warehouse locations...');
      const deleteResult = await prisma.location.deleteMany({
        where: {
          NOT: {
            id: NEW_WAREHOUSE_ID
          }
        }
      });
      console.log(`  ✅ Deleted ${deleteResult.count} old warehouse location(s)`);
    }

    // Step 8: Verify final state
    console.log('\n📋 Verification:');

    const finalLocations = await prisma.location.findMany();
    console.log(`  Locations in database: ${finalLocations.length}`);
    finalLocations.forEach(loc => {
      console.log(`    - ${loc.name} (${loc.type}): ${loc.id}`);
    });

    const stockCount = await prisma.inventoryStock.count({
      where: {
        locationId: NEW_WAREHOUSE_ID
      }
    });
    console.log(`  Inventory stocks at Sri Lanka warehouse: ${stockCount}`);

    const txnCount = await prisma.inventoryTransaction.count({
      where: {
        locationId: NEW_WAREHOUSE_ID
      }
    });
    console.log(`  Inventory transactions at Sri Lanka warehouse: ${txnCount}`);

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('  1. Add to .env file:');
    console.log(`     DEFAULT_STOCK_LOCATION=${NEW_WAREHOUSE_ID}`);
    console.log('  2. Restart your server');
    console.log('  3. Test order creation');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateToSriLankaWarehouse()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
