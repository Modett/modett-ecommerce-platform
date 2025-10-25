import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
  console.log('🧹 Starting cleanup of product catalog data...\n');

  try {
    // Delete in the correct order to respect foreign key constraints

    // First, delete order-related data
    console.log('🗑️  Deleting shipment items...');
    const deletedShipmentItems = await prisma.shipmentItem.deleteMany({});
    console.log(`   Deleted ${deletedShipmentItems.count} shipment item records`);

    console.log('🗑️  Deleting shipments...');
    const deletedShipments = await prisma.shipment.deleteMany({});
    console.log(`   Deleted ${deletedShipments.count} shipment records`);

    console.log('🗑️  Deleting return items...');
    const deletedReturnItems = await prisma.returnItem.deleteMany({});
    console.log(`   Deleted ${deletedReturnItems.count} return item records`);

    console.log('🗑️  Deleting repairs...');
    const deletedRepairs = await prisma.repair.deleteMany({});
    console.log(`   Deleted ${deletedRepairs.count} repair records`);

    console.log('🗑️  Deleting backorders...');
    const deletedBackorders = await prisma.backorder.deleteMany({});
    console.log(`   Deleted ${deletedBackorders.count} backorder records`);

    console.log('🗑️  Deleting preorders...');
    const deletedPreorders = await prisma.preorder.deleteMany({});
    console.log(`   Deleted ${deletedPreorders.count} preorder records`);

    console.log('🗑️  Deleting order items...');
    const deletedOrderItems = await prisma.orderItem.deleteMany({});
    console.log(`   Deleted ${deletedOrderItems.count} order item records`);

    console.log('🗑️  Deleting order shipments...');
    const deletedOrderShipments = await prisma.orderShipment.deleteMany({});
    console.log(`   Deleted ${deletedOrderShipments.count} order shipment records`);

    console.log('🗑️  Deleting order addresses...');
    const deletedOrderAddresses = await prisma.orderAddress.deleteMany({});
    console.log(`   Deleted ${deletedOrderAddresses.count} order address records`);

    console.log('🗑️  Deleting order status history...');
    const deletedOrderStatusHistory = await prisma.orderStatusHistory.deleteMany({});
    console.log(`   Deleted ${deletedOrderStatusHistory.count} order status history records`);

    console.log('🗑️  Deleting order events...');
    const deletedOrderEvents = await prisma.orderEvent.deleteMany({});
    console.log(`   Deleted ${deletedOrderEvents.count} order event records`);

    console.log('🗑️  Deleting purchase order items...');
    const deletedPurchaseOrderItems = await prisma.purchaseOrderItem.deleteMany({});
    console.log(`   Deleted ${deletedPurchaseOrderItems.count} purchase order item records`);

    // Now delete inventory and product-related data
    console.log('🗑️  Deleting inventory stock...');
    const deletedStock = await prisma.inventoryStock.deleteMany({});
    console.log(`   Deleted ${deletedStock.count} inventory stock records`);

    console.log('🗑️  Deleting inventory transactions...');
    const deletedTransactions = await prisma.inventoryTransaction.deleteMany({});
    console.log(`   Deleted ${deletedTransactions.count} inventory transaction records`);

    console.log('🗑️  Deleting stock alerts...');
    const deletedAlerts = await prisma.stockAlert.deleteMany({});
    console.log(`   Deleted ${deletedAlerts.count} stock alert records`);

    console.log('🗑️  Deleting pickup reservations...');
    const deletedPickupReservations = await prisma.pickupReservation.deleteMany({});
    console.log(`   Deleted ${deletedPickupReservations.count} pickup reservation records`);

    console.log('🗑️  Deleting cart reservations...');
    const deletedReservations = await prisma.reservation.deleteMany({});
    console.log(`   Deleted ${deletedReservations.count} reservation records`);

    console.log('🗑️  Deleting cart items...');
    const deletedCartItems = await prisma.cartItem.deleteMany({});
    console.log(`   Deleted ${deletedCartItems.count} cart item records`);

    console.log('🗑️  Deleting wishlist items...');
    const deletedWishlistItems = await prisma.wishlistItem.deleteMany({});
    console.log(`   Deleted ${deletedWishlistItems.count} wishlist item records`);

    console.log('🗑️  Deleting reminders...');
    const deletedReminders = await prisma.reminder.deleteMany({});
    console.log(`   Deleted ${deletedReminders.count} reminder records`);

    console.log('🗑️  Deleting product reviews...');
    const deletedReviews = await prisma.productReview.deleteMany({});
    console.log(`   Deleted ${deletedReviews.count} product review records`);

    console.log('🗑️  Deleting product tag associations...');
    const deletedTagAssociations = await prisma.productTagAssociation.deleteMany({});
    console.log(`   Deleted ${deletedTagAssociations.count} product tag associations`);

    console.log('🗑️  Deleting product tags...');
    const deletedTags = await prisma.productTag.deleteMany({});
    console.log(`   Deleted ${deletedTags.count} product tags`);

    console.log('🗑️  Deleting editorial look products...');
    const deletedEditorialLookProducts = await prisma.editorialLookProduct.deleteMany({});
    console.log(`   Deleted ${deletedEditorialLookProducts.count} editorial look product associations`);

    console.log('🗑️  Deleting editorial looks...');
    const deletedEditorialLooks = await prisma.editorialLook.deleteMany({});
    console.log(`   Deleted ${deletedEditorialLooks.count} editorial looks`);

    console.log('🗑️  Deleting variant media...');
    const deletedVariantMedia = await prisma.variantMedia.deleteMany({});
    console.log(`   Deleted ${deletedVariantMedia.count} variant media records`);

    console.log('🗑️  Deleting product media...');
    const deletedProductMedia = await prisma.productMedia.deleteMany({});
    console.log(`   Deleted ${deletedProductMedia.count} product media records`);

    console.log('🗑️  Deleting product variants...');
    const deletedVariants = await prisma.productVariant.deleteMany({});
    console.log(`   Deleted ${deletedVariants.count} product variants`);

    console.log('🗑️  Deleting product categories...');
    const deletedProductCategories = await prisma.productCategory.deleteMany({});
    console.log(`   Deleted ${deletedProductCategories.count} product category associations`);

    console.log('🗑️  Deleting products...');
    const deletedProducts = await prisma.product.deleteMany({});
    console.log(`   Deleted ${deletedProducts.count} products`);

    console.log('🗑️  Deleting media assets...');
    const deletedMediaAssets = await prisma.mediaAsset.deleteMany({});
    console.log(`   Deleted ${deletedMediaAssets.count} media assets`);

    console.log('🗑️  Deleting categories...');
    const deletedCategories = await prisma.category.deleteMany({});
    console.log(`   Deleted ${deletedCategories.count} categories`);

    console.log('🗑️  Deleting size guides...');
    const deletedSizeGuides = await prisma.sizeGuide.deleteMany({});
    console.log(`   Deleted ${deletedSizeGuides.count} size guides`);

    console.log('🗑️  Deleting locations (warehouses/stores)...');
    const deletedLocations = await prisma.location.deleteMany({});
    console.log(`   Deleted ${deletedLocations.count} locations`);

    console.log('\n✅ Cleanup completed successfully!');
    console.log('\n💡 You can now run the seed script to populate with fresh data:');
    console.log('   npm run db:seed');

  } catch (error) {
    console.error('\n❌ Cleanup failed:', error);
    throw error;
  }
}

cleanup()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
