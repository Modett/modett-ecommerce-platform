"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { cartService } from "@/services/cart.service";
import { productService } from "@/services/product.service";
import { CartItem } from "@/features/cart/components/cart-item";
import { OrderSummary } from "@/features/cart/components/order-summary";
import { ProductCard } from "@/features/product-catalog/components/product-card";

export default function CartPage() {
  const [cartId, setCartId] = useState<string | null>(null);

  // Get cart ID from localStorage or generate
  useEffect(() => {
    const storedCartId = localStorage.getItem("modett_cart_id");
    if (storedCartId) {
      setCartId(storedCartId);
    }
  }, []);

  const {
    data: cart,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["cart", cartId],
    queryFn: async () => {
      if (!cartId) return null;
      const cartData = await cartService.getCart(cartId);
      console.log("Cart API Response:", cartData);
      console.log("First item product data:", cartData?.items?.[0]?.product);
      return cartData;
    },
    enabled: !!cartId,
  });

  const { data: recommendedProducts } = useQuery({
    queryKey: ["cart-recommendations"],
    queryFn: () => productService.getFeaturedProducts(6),
  });

  const handleQuantityChange = async (
    cartItemId: string,
    newQuantity: number
  ) => {
    // TODO: Implement quantity update API call
    console.log("Update quantity:", cartItemId, newQuantity);
    await refetch();
  };

  const handleRemoveItem = async (cartItemId: string) => {
    // TODO: Implement remove item API call
    console.log("Remove item:", cartItemId);
    await refetch();
  };

  if (isLoading) {
    return (
      <main className="w-full min-h-screen bg-[#EFECE5] flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading cart...</div>
      </main>
    );
  }

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  return (
    <main className="w-full bg-[#EFECE5]">
      {isEmpty ? (
        /* Empty Cart State */
        <div className="w-full max-w-[1440px] mx-auto px-4 md:px-[80px] py-[80px]">
          <div className="text-center">
            <h1
              className="text-[32px] leading-[40px] font-medium mb-[24px]"
              style={{
                fontFamily: "Playfair Display, serif",
                color: "#232D35",
              }}
            >
              Your cart is empty
            </h1>
            <p
              className="text-[16px] leading-[24px] font-normal mb-[32px]"
              style={{ fontFamily: "Raleway, sans-serif", color: "#6B7B8A" }}
            >
              Discover our collections and find something you love.
            </p>
            <Link
              href="/collections"
              className="inline-block px-[32px] py-[12px] bg-[#3E5460] text-white hover:bg-[#2c3b44] transition-colors text-[14px] font-medium uppercase tracking-[3px]"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Cart Section */}
          <div className="w-full max-w-[1440px] mx-auto px-4 md:px-[80px] py-[64px]">
            <h1
              className="text-[32px] leading-[40px] font-medium mb-[48px]"
              style={{
                fontFamily: "Playfair Display, serif",
                color: "#232D35",
              }}
            >
              Shopping Cart
            </h1>

            <div className="flex flex-col lg:flex-row gap-[80px]">
              {/* Cart Items Table */}
              <div className="flex-1">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-[16px] pb-[16px] border-b border-[#D4C4A8] mb-[8px]">
                  <div className="col-span-5">
                    <span
                      className="text-[12px] leading-[18px] font-medium uppercase tracking-[2px]"
                      style={{
                        fontFamily: "Raleway, sans-serif",
                        color: "#6B7B8A",
                      }}
                    >
                      Product
                    </span>
                  </div>
                  <div className="col-span-3">
                    <span
                      className="text-[12px] leading-[18px] font-medium uppercase tracking-[2px]"
                      style={{
                        fontFamily: "Raleway, sans-serif",
                        color: "#6B7B8A",
                      }}
                    >
                      Description
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span
                      className="text-[12px] leading-[18px] font-medium uppercase tracking-[2px]"
                      style={{
                        fontFamily: "Raleway, sans-serif",
                        color: "#6B7B8A",
                      }}
                    >
                      Quantity
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span
                      className="text-[12px] leading-[18px] font-medium uppercase tracking-[2px]"
                      style={{
                        fontFamily: "Raleway, sans-serif",
                        color: "#6B7B8A",
                      }}
                    >
                      Price
                    </span>
                  </div>
                </div>

                {/* Cart Items */}
                <div className="flex flex-col">
                  {cart.items.map((item, index) => (
                    <CartItem
                      key={item.id || item.cartItemId || `cart-item-${index}`}
                      cartItemId={item.id || item.cartItemId || item.variantId}
                      productId={item.product?.productId || item.variantId}
                      slug={item.product?.slug || ""}
                      title={item.product?.title || "Product"}
                      price={item.unitPrice}
                      image={item.product?.images?.[0]?.url || "/placeholder-product.jpg"}
                      color={item.variant?.color || undefined}
                      size={item.variant?.size || undefined}
                      quantity={item.quantity}
                      onQuantityChange={handleQuantityChange}
                      onRemove={handleRemoveItem}
                    />
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:flex-shrink-0">
                <OrderSummary
                  subtotal={cart.summary.subtotal}
                  discount={cart.summary.discount}
                  total={cart.summary.total}
                />
              </div>
            </div>
          </div>

          {/* You may also be interested in */}
          {recommendedProducts && recommendedProducts.length > 0 && (
            <section className="w-full bg-[#EFECE5] py-[80px]">
              <div className="w-full max-w-[1440px] mx-auto px-4 md:px-[80px]">
                <h2
                  className="text-[24px] leading-[32px] font-normal mb-[48px]"
                  style={{
                    fontFamily: "Playfair Display, serif",
                    color: "#232D35",
                  }}
                >
                  You may also be interested in
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[32px]">
                  {recommendedProducts.slice(0, 6).map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      productId={product.productId}
                      slug={product.slug}
                      title={product.title}
                      price={product.price}
                      compareAtPrice={product.compareAtPrice}
                      image={
                        product.images?.[0]?.url || "/placeholder-product.jpg"
                      }
                      variants={product.variants || []}
                    />
                  ))}
                </div>

                {/* View More Button */}
                <div className="w-full max-w-[1280px] h-[122px] mx-auto flex flex-col items-center justify-center gap-[24px] pt-[64px]">
                  <Link href="/collections">
                    <button className="w-full max-w-[200px] h-[48px] px-6 py-3 bg-[#3E5460] hover:bg-[#2c3b44] transition-colors">
                      <span
                        className="text-[14px] font-medium leading-[24px] tracking-[3px] uppercase text-white whitespace-nowrap"
                        style={{ fontFamily: "Reddit Sans, sans-serif" }}
                      >
                        VIEW MORE
                      </span>
                    </button>
                  </Link>
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}
