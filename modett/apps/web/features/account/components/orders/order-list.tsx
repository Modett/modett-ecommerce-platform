"use client";

import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ChevronRight } from "lucide-react";
import { type OrderSummary } from "../../types";
import { useQuery } from "@tanstack/react-query";
import { backendApiClient } from "@/lib/backend-api-client";

interface OrderListProps {
  orders: OrderSummary[];
  isLoading?: boolean;
}

// Helper component to fetch and display product image
function OrderItemImage({ productId }: { productId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["product-image", productId],
    queryFn: async () => {
      const response = await backendApiClient.get(
        `/catalog/products/${productId}`,
      );
      const imageUrl =
        response.data?.data?.images?.[0]?.url ||
        "/images/products/product-1.jpg";
      return imageUrl;
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  if (isLoading || !data) {
    return <div className="w-full h-full bg-[#F5F5F5] animate-pulse" />;
  }

  return (
    <Image src={data} alt="Product" fill className="object-cover" unoptimized />
  );
}

export function OrderList({ orders, isLoading }: OrderListProps) {
  const validOrders = Array.isArray(orders) ? orders : [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse h-24 bg-white/50 rounded" />
        ))}
      </div>
    );
  }

  if (validOrders.length === 0) {
    return (
      <div className="text-center py-12 mt-8">
        <p
          className="text-[#765C4D] text-[16px] mb-6 font-light"
          style={{ fontFamily: "Raleway, sans-serif" }}
        >
          You haven't placed any orders yet.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-[#232D35] text-white text-[12px] uppercase tracking-widest hover:bg-[#3E4851] transition-colors"
          style={{ fontFamily: "Raleway, sans-serif" }}
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-8">
      {validOrders.map((order) => (
        <div
          key={order.orderId}
          className="border border-[#E5E0D6] p-6 hover:shadow-sm transition-shadow bg-white"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-6 pb-6 border-b border-[#F0F0F0]">
            <div className="space-y-1">
              <h3
                className="text-[18px] text-[#232D35] font-medium"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                Order #{order.orderNumber}
              </h3>
              <p className="text-[14px] text-[#888888]">
                {format(new Date(order.createdAt), "MMMM d, yyyy")}
              </p>
            </div>
            <div className="text-right">
              <p
                className="text-[16px] text-[#232D35]"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: order.currency,
                }).format(Number(order.totals.total))}
              </p>
              <span
                className="inline-block px-3 py-1 mt-2 text-[12px] uppercase tracking-wider bg-[#F9F9F9] text-[#232D35]"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                {order.status.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          {/* Items Preview */}
          <div className="flex gap-4 overflow-x-auto pb-2">
            {order.items.slice(0, 4).map((item: any) => (
              <div
                key={item.orderItemId}
                className="relative w-[80px] h-[100px] flex-shrink-0 bg-[#F5F5F5]"
              >
                {item.productSnapshot?.imageUrl ? (
                  <Image
                    src={item.productSnapshot.imageUrl}
                    alt={item.productSnapshot.name || "Product image"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <OrderItemImage productId={item.productSnapshot?.productId} />
                )}
              </div>
            ))}
            {order.items.length > 4 && (
              <div
                className="w-[80px] h-[100px] flex-shrink-0 flex items-center justify-center bg-[#F9F9F9] text-[#888888] text-[14px]"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                +{order.items.length - 4} more
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end">
            <Link
              href={`/account/orders/${order.orderId}`}
              className="flex items-center gap-2 text-[14px] text-[#C78869] hover:text-[#a06d54] transition-colors uppercase tracking-wider"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              View Order Details
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
