import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    console.log('🗑️  Starting database cleanup...\n');

    // Delete in order to respect foreign key constraints
    // Child tables first, then parent tables

    console.log('Deleting engagement data...');
    await prisma.appointment.deleteMany({});
    await prisma.productReview.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.reminder.deleteMany({});
    await prisma.wishlistItem.deleteMany({});
    await prisma.wishlist.deleteMany({});
    await prisma.newsletterSubscription.deleteMany({});

    console.log('Deleting customer care data...');
    await prisma.customerFeedback.deleteMany({});
    await prisma.goodwillRecord.deleteMany({});
    await prisma.repair.deleteMany({});
    await prisma.returnItem.deleteMany({});
    await prisma.returnRequest.deleteMany({});
    await prisma.chatMessage.deleteMany({});
    await prisma.chatSession.deleteMany({});
    await prisma.supportAgent.deleteMany({});
    await prisma.ticketMessage.deleteMany({});
    await prisma.supportTicket.deleteMany({});

    console.log('Deleting payment & loyalty data...');
    await prisma.paymentWebhookEvent.deleteMany({});
    await prisma.loyaltyTransaction.deleteMany({});
    await prisma.loyaltyAccount.deleteMany({});
    await prisma.loyaltyProgram.deleteMany({});
    await prisma.promotionUsage.deleteMany({});
    await prisma.promotion.deleteMany({});
    await prisma.giftCardTransaction.deleteMany({});
    await prisma.giftCard.deleteMany({});
    await prisma.bnplTransaction.deleteMany({});
    await prisma.paymentTransaction.deleteMany({});
    await prisma.paymentIntent.deleteMany({});

    console.log('Deleting inventory data...');
    await prisma.pickupReservation.deleteMany({});
    await prisma.purchaseOrderItem.deleteMany({});
    await prisma.purchaseOrder.deleteMany({});
    await prisma.supplier.deleteMany({});
    await prisma.stockAlert.deleteMany({});
    await prisma.inventoryTransaction.deleteMany({});
    await prisma.inventoryStock.deleteMany({});
    await prisma.location.deleteMany({});

    console.log('Deleting fulfillment data...');
    await prisma.shipmentItem.deleteMany({});
    await prisma.shipment.deleteMany({});

    console.log('Deleting order data...');
    await prisma.orderEvent.deleteMany({});
    await prisma.preorder.deleteMany({});
    await prisma.backorder.deleteMany({});
    await prisma.orderStatusHistory.deleteMany({});
    await prisma.orderShipment.deleteMany({});
    await prisma.orderAddress.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});

    console.log('Deleting cart data...');
    await prisma.reservation.deleteMany({});
    await prisma.cartItem.deleteMany({});
    await prisma.shoppingCart.deleteMany({});

    console.log('Deleting product catalog data...');
    await prisma.editorialLookProduct.deleteMany({});
    await prisma.editorialLook.deleteMany({});
    await prisma.sizeGuide.deleteMany({});
    await prisma.productTagAssociation.deleteMany({});
    await prisma.productTag.deleteMany({});
    await prisma.variantMedia.deleteMany({});
    await prisma.productMedia.deleteMany({});
    await prisma.mediaAsset.deleteMany({});
    await prisma.productCategory.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.productVariant.deleteMany({});
    await prisma.product.deleteMany({});

    console.log('Deleting user management data...');
    await prisma.userProfile.deleteMany({});
    await prisma.paymentMethod.deleteMany({});
    await prisma.userAddress.deleteMany({});
    await prisma.socialLogin.deleteMany({});
    await prisma.user.deleteMany({});

    console.log('\n✅ Database cleared successfully!');
    console.log('All data has been deleted while preserving the schema.');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
