import React from "react";
import type { OrderDetails } from "@/features/order-management/order-api";
import Image from "next/image";
import {
  COLORS,
  FONTS,
  TEXT_STYLES,
  COMMON_CLASSES,
} from "@/features/cart/constants/styles";

interface OrderTrackingResultProps {
  order: OrderDetails;
}

const STYLES = {
  container: `mt-12 border ${COMMON_CLASSES.borderPrimary} bg-white/50`,
  section: `p-6 md:p-8 border-b ${COMMON_CLASSES.borderPrimary} last:border-b-0`,
  statusBadge: (status: string) => {
    const baseStyles =
      "inline-block px-4 py-1 text-[12px] font-medium uppercase tracking-wider border";
    const statusStyles: Record<string, string> = {
      created: "bg-gray-100/50 text-gray-700 border-gray-200",
      paid: "bg-blue-50 text-blue-800 border-blue-200",
      fulfilled: "bg-emerald-50 text-emerald-800 border-emerald-200",
      partially_returned: "bg-amber-50 text-amber-800 border-amber-200",
      refunded: "bg-orange-50 text-orange-800 border-orange-200",
      cancelled: "bg-red-50 text-red-800 border-red-200",
    };
    return `${baseStyles} ${statusStyles[status] || "bg-gray-100 text-gray-700 border-gray-200"}`;
  },
};

export function OrderTrackingResult({ order }: OrderTrackingResultProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: order.currency || "USD",
    }).format(price);
  };

  return (
    <div className={STYLES.container}>
      {/* Order Header */}
      <div className={STYLES.section}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2
              className="text-[24px] md:text-[28px] mb-2"
              style={TEXT_STYLES.productTitle}
            >
              Order {order.orderNumber}
            </h2>
            <p style={TEXT_STYLES.bodySlate}>
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <div>
            <span className={STYLES.statusBadge(order.status)}>
              {order.status.replace("_", " ")}
            </span>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className={STYLES.section}>
        <h3
          className="text-[18px] mb-6 uppercase tracking-[1px]"
          style={TEXT_STYLES.bodyGraphite}
        >
          Order Items
        </h3>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div
              key={item.orderItemId}
              className={`flex gap-4 pb-4 border-b ${COMMON_CLASSES.borderPrimary} last:border-b-0 last:pb-0`}
            >
              {/* Product Image */}
              {item.productSnapshot.imageUrl && (
                <div
                  className={`relative w-20 h-20 flex-shrink-0 border ${COMMON_CLASSES.borderPrimary}`}
                >
                  <Image
                    src={item.productSnapshot.imageUrl}
                    alt={item.productSnapshot.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Product Details */}
              <div className="flex-1">
                <h4
                  className="text-[16px] mb-1 font-medium"
                  style={{
                    ...TEXT_STYLES.productTitle,
                    fontFamily: FONTS.playfair,
                  }}
                >
                  {item.productSnapshot.name}
                </h4>
                {item.productSnapshot.variantName && (
                  <p className="text-[14px]" style={TEXT_STYLES.secondary}>
                    Variant: {item.productSnapshot.variantName}
                  </p>
                )}
                <p
                  className="text-[12px] uppercase tracking-wider mt-1"
                  style={{ color: COLORS.sand }}
                >
                  SKU: {item.productSnapshot.sku}
                </p>
                <p
                  className="text-[14px] mt-1"
                  style={TEXT_STYLES.bodyGraphite}
                >
                  Qty: {item.quantity}
                </p>
                {item.isGift && (
                  <p className="mt-2 text-[12px] text-emerald-700 italic border-l-2 border-emerald-500 pl-2">
                    🎁 Gift Item
                    {item.giftMessage && ` - "${item.giftMessage}"`}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="text-right">
                <p className="text-[16px]" style={TEXT_STYLES.bodyGraphite}>
                  {formatPrice(item.productSnapshot.price)}
                </p>
                <p className="text-[14px]" style={TEXT_STYLES.secondary}>
                  Total: {formatPrice(item.subtotal)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className={`${STYLES.section} ${COMMON_CLASSES.orderSummaryBg}`}>
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="hidden md:block">
            {/* Empty space or additional info could go here */}
          </div>

          <div className="w-full md:w-[350px] space-y-3">
            <h3
              className="text-[18px] mb-4 uppercase tracking-[1px]"
              style={TEXT_STYLES.bodyGraphite}
            >
              Order Summary
            </h3>

            <div
              className="flex justify-between text-[14px]"
              style={{ color: COLORS.graphite }}
            >
              <span>Subtotal</span>
              <span>{formatPrice(order.totals.subtotal)}</span>
            </div>

            <div
              className="flex justify-between text-[14px]"
              style={{ color: COLORS.graphite }}
            >
              <span>Shipping</span>
              <span>
                {order.totals.shipping === 0
                  ? "Free"
                  : formatPrice(order.totals.shipping)}
              </span>
            </div>

            <div
              className="flex justify-between text-[14px]"
              style={{ color: COLORS.graphite }}
            >
              <span>Tax</span>
              <span>{formatPrice(order.totals.tax)}</span>
            </div>

            {order.totals.discount > 0 && (
              <div className="flex justify-between text-[14px] text-emerald-700">
                <span>Discount</span>
                <span>-{formatPrice(order.totals.discount)}</span>
              </div>
            )}

            <div
              className="flex justify-between text-[18px] pt-4 mt-2 border-t border-[#D4C4A8]"
              style={TEXT_STYLES.productTitle}
            >
              <span>Total</span>
              <span>{formatPrice(order.totals.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Information & Addresses */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Shipping Info Column */}
        <div
          className={`p-6 md:p-8 border-b md:border-b-0 md:border-r ${COMMON_CLASSES.borderPrimary}`}
        >
          <h3
            className="text-[16px] mb-6 uppercase tracking-[1px] font-medium"
            style={TEXT_STYLES.bodyGraphite}
          >
            Shipment Details
          </h3>

          {order.shipments && order.shipments.length > 0 ? (
            <div className="space-y-6">
              {order.shipments.map((shipment) => (
                <div key={shipment.shipmentId} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${shipment.isDelivered ? "bg-emerald-500" : "bg-blue-500"}`}
                    />
                    <span className="text-[14px] font-medium uppercase tracking-wider">
                      {shipment.isDelivered ? "Delivered" : "In Transit"}
                    </span>
                  </div>

                  <div className="pl-4 border-l border-[#D4C4A8] space-y-1">
                    <p className="text-[14px]">
                      <span className="text-gray-500">Carrier:</span>{" "}
                      {shipment.carrier || "Standard"}
                    </p>
                    <p className="text-[14px]">
                      <span className="text-gray-500">Tracking:</span>{" "}
                      {shipment.trackingNumber || "Pending"}
                    </p>
                    {shipment.shippedAt && (
                      <p className="text-[14px]">
                        <span className="text-gray-500">Shipped:</span>{" "}
                        {formatDate(shipment.shippedAt)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[14px] italic text-gray-500">
              No shipment information available yet.
            </p>
          )}
        </div>

        {/* Address Column */}
        <div className="p-6 md:p-8">
          <h3
            className="text-[16px] mb-6 uppercase tracking-[1px] font-medium"
            style={TEXT_STYLES.bodyGraphite}
          >
            Delivery Address
          </h3>

          {order.shippingAddress && (
            <div
              style={{ color: COLORS.graphite }}
              className="text-[15px] leading-relaxed"
            >
              <p className="font-medium mb-1 font-serif text-[18px]">
                {order.shippingAddress.firstName}{" "}
                {order.shippingAddress.lastName}
              </p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && (
                <p>{order.shippingAddress.addressLine2}</p>
              )}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p className="uppercase tracking-wider text-[12px] mt-1">
                {order.shippingAddress.country}
              </p>

              {order.shippingAddress.phone && (
                <p className="mt-4 text-[14px] text-gray-500">
                  {order.shippingAddress.phone}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
