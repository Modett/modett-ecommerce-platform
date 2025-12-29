import React from "react";
import type { OrderDetails } from "@/lib/order-api";
import Image from "next/image";

interface OrderTrackingResultProps {
  order: OrderDetails;
}

const STYLES = {
  container: "mt-12 border border-[#E5E0D6] bg-white/50",
  section: "p-6 md:p-8 border-b border-[#E5E0D6] last:border-b-0",
  title: {
    fontFamily: "Raleway, sans-serif",
    fontWeight: 500,
    color: "#232D35",
  },
  label: {
    fontFamily: "Raleway, sans-serif",
    fontWeight: 400,
    color: "#6B7280",
    fontSize: "14px",
  },
  value: {
    fontFamily: "Raleway, sans-serif",
    fontWeight: 400,
    color: "#232D35",
    fontSize: "14px",
  },
  statusBadge: (status: string) => {
    const baseStyles = "inline-block px-4 py-1 text-[12px] font-medium uppercase tracking-wider";
    const statusStyles: Record<string, string> = {
      created: "bg-gray-100 text-gray-700",
      paid: "bg-blue-100 text-blue-700",
      fulfilled: "bg-green-100 text-green-700",
      partially_returned: "bg-yellow-100 text-yellow-700",
      refunded: "bg-orange-100 text-orange-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return `${baseStyles} ${statusStyles[status] || "bg-gray-100 text-gray-700"}`;
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
              style={STYLES.title}
            >
              Order {order.orderNumber}
            </h2>
            <p style={STYLES.label}>
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
        <h3 className="text-[18px] mb-6" style={STYLES.title}>
          Order Items
        </h3>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div
              key={item.orderItemId}
              className="flex gap-4 pb-4 border-b border-[#E5E0D6] last:border-b-0 last:pb-0"
            >
              {/* Product Image */}
              {item.productSnapshot.imageUrl && (
                <div className="relative w-20 h-20 flex-shrink-0 border border-[#E5E0D6]">
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
                <h4 className="text-[16px] mb-1" style={STYLES.value}>
                  {item.productSnapshot.name}
                </h4>
                {item.productSnapshot.variantName && (
                  <p style={STYLES.label}>
                    Variant: {item.productSnapshot.variantName}
                  </p>
                )}
                <p style={STYLES.label}>
                  SKU: {item.productSnapshot.sku}
                </p>
                <p style={STYLES.label}>
                  Quantity: {item.quantity}
                </p>
                {item.isGift && (
                  <p className="mt-2 text-[12px] text-green-600">
                    🎁 Gift Item
                    {item.giftMessage && ` - "${item.giftMessage}"`}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="text-right">
                <p className="text-[16px]" style={STYLES.value}>
                  {formatPrice(item.productSnapshot.price)}
                </p>
                <p style={STYLES.label}>
                  Subtotal: {formatPrice(item.subtotal)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className={STYLES.section}>
        <h3 className="text-[18px] mb-6" style={STYLES.title}>
          Order Summary
        </h3>
        <div className="space-y-2 max-w-md ml-auto">
          <div className="flex justify-between" style={STYLES.label}>
            <span>Subtotal</span>
            <span>{formatPrice(order.totals.subtotal)}</span>
          </div>
          <div className="flex justify-between" style={STYLES.label}>
            <span>Shipping</span>
            <span>{formatPrice(order.totals.shipping)}</span>
          </div>
          <div className="flex justify-between" style={STYLES.label}>
            <span>Tax</span>
            <span>{formatPrice(order.totals.tax)}</span>
          </div>
          {order.totals.discount > 0 && (
            <div className="flex justify-between text-green-600" style={STYLES.label}>
              <span>Discount</span>
              <span>-{formatPrice(order.totals.discount)}</span>
            </div>
          )}
          <div
            className="flex justify-between text-[18px] pt-2 border-t border-[#E5E0D6]"
            style={STYLES.title}
          >
            <span>Total</span>
            <span>{formatPrice(order.totals.total)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Information */}
      {order.shipments && order.shipments.length > 0 && (
        <div className={STYLES.section}>
          <h3 className="text-[18px] mb-6" style={STYLES.title}>
            Shipping Information
          </h3>
          <div className="space-y-4">
            {order.shipments.map((shipment) => (
              <div
                key={shipment.shipmentId}
                className="p-4 bg-[#EFECE5] border border-[#E5E0D6]"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p style={STYLES.label}>Carrier</p>
                    <p style={STYLES.value}>
                      {shipment.carrier || "Not assigned"}
                    </p>
                  </div>
                  <div>
                    <p style={STYLES.label}>Service</p>
                    <p style={STYLES.value}>
                      {shipment.service || "Not assigned"}
                    </p>
                  </div>
                  <div>
                    <p style={STYLES.label}>Tracking Number</p>
                    <p style={STYLES.value}>
                      {shipment.trackingNumber || "Not available"}
                    </p>
                  </div>
                  <div>
                    <p style={STYLES.label}>Status</p>
                    <p style={STYLES.value}>
                      {shipment.isDelivered
                        ? "✅ Delivered"
                        : shipment.isShipped
                        ? "🚚 Shipped"
                        : "📦 Processing"}
                    </p>
                  </div>
                  {shipment.shippedAt && (
                    <div>
                      <p style={STYLES.label}>Shipped On</p>
                      <p style={STYLES.value}>
                        {formatDate(shipment.shippedAt)}
                      </p>
                    </div>
                  )}
                  {shipment.deliveredAt && (
                    <div>
                      <p style={STYLES.label}>Delivered On</p>
                      <p style={STYLES.value}>
                        {formatDate(shipment.deliveredAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shipping Address */}
      {order.shippingAddress && (
        <div className={STYLES.section}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-[18px] mb-4" style={STYLES.title}>
                Shipping Address
              </h3>
              <div style={STYLES.value}>
                <p>
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
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && (
                  <p className="mt-2">Phone: {order.shippingAddress.phone}</p>
                )}
              </div>
            </div>

            {order.billingAddress && (
              <div>
                <h3 className="text-[18px] mb-4" style={STYLES.title}>
                  Billing Address
                </h3>
                <div style={STYLES.value}>
                  <p>
                    {order.billingAddress.firstName}{" "}
                    {order.billingAddress.lastName}
                  </p>
                  <p>{order.billingAddress.addressLine1}</p>
                  {order.billingAddress.addressLine2 && (
                    <p>{order.billingAddress.addressLine2}</p>
                  )}
                  <p>
                    {order.billingAddress.city}, {order.billingAddress.state}{" "}
                    {order.billingAddress.postalCode}
                  </p>
                  <p>{order.billingAddress.country}</p>
                  {order.billingAddress.phone && (
                    <p className="mt-2">Phone: {order.billingAddress.phone}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
