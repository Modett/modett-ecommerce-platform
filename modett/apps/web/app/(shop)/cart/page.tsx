"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CartItem } from "@/features/cart/components/cart-item";
import { OrderSummary } from "@/features/cart/components/order-summary";
import { ProductCard } from "@/features/product-catalog/components/product-card";
import {
  TEXT_STYLES,
  COMMON_CLASSES,
  RESPONSIVE,
} from "@/features/cart/constants/styles";
import { useCart, useUpdateCartQuantity, useRemoveCartItem } from "@/features/cart/queries";
import { getStoredCartId } from "@/features/cart/utils";
import { useFeaturedProducts } from "@/features/product-catalog/queries";

export default function CartPage() {
  const [cartId, setCartId] = useState<string | null>(null);

  useEffect(() => {
    const storedCartId = getStoredCartId();
    if (storedCartId) {
      setCartId(storedCartId);
    }
  }, []);

  const {
    data: cart,
    isLoading,
  } = useCart(cartId);

  const { data: recommendedProducts } = useFeaturedProducts(6);

  const updateQuantityMutation = useUpdateCartQuantity();
  const removeItemMutation = useRemoveCartItem();

  const handleQuantityChange = async (
    variantId: string,
    newQuantity: number
  ) => {
    if (!cartId) return;

    try {
      await updateQuantityMutation.mutateAsync({
        cartId,
        variantId,
        quantity: newQuantity,
      });
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  const handleRemoveItem = async (variantId: string) => {
    if (!cartId) return;

    try {
      await removeItemMutation.mutateAsync({
        cartId,
        variantId,
      });
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  if (isLoading) {
    return (
      <main
        className={`w-full min-h-screen ${COMMON_CLASSES.pageBg} flex items-center justify-center`}
      >
        <div className="animate-pulse text-lg">Loading cart...</div>
      </main>
    );
  }

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  return (
    <main className={`w-full ${COMMON_CLASSES.pageBg}`}>
      {isEmpty ? (
        <div className={`${COMMON_CLASSES.responsiveContainer} py-[80px]`}>
          <div className="text-center">
            <h1
              className="text-[32px] leading-[40px] font-medium mb-[24px]"
              style={TEXT_STYLES.pageTitle}
            >
              Your cart is empty
            </h1>
            <p
              className="text-[16px] leading-[24px] font-normal mb-[32px]"
              style={TEXT_STYLES.bodySlate}
            >
              Discover our collections and find something you love.
            </p>
            <Link
              href="/collections"
              className={`inline-block px-[32px] py-[12px] ${COMMON_CLASSES.primaryButton} text-[14px] font-medium`}
              style={TEXT_STYLES.button}
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className={`w-full max-w-[1440px] mx-auto ${RESPONSIVE.padding.page} ${RESPONSIVE.padding.section}`}>
            {/* Cart Label */}
            <div className="h-[24px] mb-8 md:mb-10 lg:mb-[48px]">
              <span
                className="text-[14px] md:text-[15px] lg:text-[16px] leading-[24px] font-medium uppercase tracking-[3px] md:tracking-[3.5px] lg:tracking-[4px]"
                style={TEXT_STYLES.accent}
              >
                CART
              </span>
            </div>

            <div
              className={`flex flex-col lg:flex-row ${RESPONSIVE.gap.section} lg:items-start`}
            >
              <div className={`${RESPONSIVE.cartTable.mobile} ${RESPONSIVE.cartTable.tablet} ${RESPONSIVE.cartTable.desktop}`}>
                <div
                  className={`flex h-[48px] md:h-[52px] lg:h-[56px] px-3 md:px-4 lg:px-[16px] items-center ${RESPONSIVE.gap.item} border-b ${COMMON_CLASSES.borderLight} ${COMMON_CLASSES.cartItemBg}`}
                >
                  <div className="w-[120px] md:w-[135px] lg:w-[149.61px] h-[21px]">
                    <span
                      className="text-[12px] md:text-[13px] lg:text-[14px] leading-[20px] md:leading-[22px] lg:leading-[24px] font-normal tracking-[0.8px] md:tracking-[0.9px] lg:tracking-[1.03px]"
                      style={TEXT_STYLES.tableHeader}
                    >
                      Product
                    </span>
                  </div>
                  <div className="flex-1 md:w-[280px] lg:w-[342.02px] h-[24px] pl-3 md:pl-4 lg:pl-[20px]">
                    <span
                      className="text-[12px] md:text-[13px] lg:text-[14px] leading-[20px] md:leading-[22px] lg:leading-[24px] font-normal tracking-[0.8px] md:tracking-[0.9px] lg:tracking-[1.03px]"
                      style={TEXT_STYLES.tableHeader}
                    >
                      Description
                    </span>
                  </div>
                  <div className="w-[60px] md:w-[65px] lg:w-[70px] h-[21px] pr-2 md:pr-3 lg:pr-[14.8px]">
                    <span
                      className="text-[12px] md:text-[13px] lg:text-[14px] leading-[20px] md:leading-[22px] lg:leading-[24px] font-normal tracking-[0.8px] md:tracking-[0.9px] lg:tracking-[1.03px] inline-block -ml-[25px] md:-ml-[28px] lg:-ml-[30px]"
                      style={TEXT_STYLES.tableHeader}
                    >
                      Quantity
                    </span>
                  </div>
                  <div className="w-[90px] md:w-[100px] lg:w-[112px] h-[24px] text-right">
                    <span
                      className="text-[12px] md:text-[13px] lg:text-[14px] leading-[20px] md:leading-[22px] lg:leading-[24px] font-normal tracking-[0.8px] md:tracking-[0.9px] lg:tracking-[1.03px]"
                      style={TEXT_STYLES.tableHeader}
                    >
                      Price
                    </span>
                  </div>
                </div>

                {/* Cart Items */}
                <div className="flex flex-col gap-4 md:gap-5 lg:gap-[24px] pt-4 md:pt-5 lg:pt-[24px]">
                  {cart.items.map((item, index) => {
                    const slug = item.product?.slug || "";
                    return (
                      <CartItem
                        key={item.id || item.cartItemId || `cart-item-${index}`}
                        cartItemId={item.variantId}
                        productId={item.product?.productId || item.variantId}
                        slug={slug}
                        title={item.product?.title || "Product"}
                        price={item.unitPrice}
                        image={
                          item.product?.images?.[0]?.url ||
                          "/placeholder-product.jpg"
                        }
                        color={item.variant?.color || undefined}
                        size={item.variant?.size || undefined}
                        quantity={item.quantity}
                        onQuantityChange={handleQuantityChange}
                        onRemove={handleRemoveItem}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Order Summary */}
              <div className={`${RESPONSIVE.orderSummary.mobile} ${RESPONSIVE.orderSummary.desktop} lg:flex-shrink-0`}>
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
            <section className={`w-full ${COMMON_CLASSES.pageBg} ${RESPONSIVE.padding.section}`}>
              <div className={`w-full max-w-[1440px] mx-auto ${RESPONSIVE.padding.page}`}>
                <h2
                  className="text-[20px] md:text-[22px] lg:text-[24px] leading-[28px] md:leading-[30px] lg:leading-[32px] font-normal mb-8 md:mb-10 lg:mb-[48px]"
                  style={TEXT_STYLES.pageTitle}
                >
                  You may also be interested in
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 xl:gap-[32px]">
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
                <div
                  className={`w-full max-w-[1280px] mx-auto flex flex-col items-center justify-center ${RESPONSIVE.gap.item} pt-8 md:pt-12 lg:pt-16 xl:pt-[64px] pb-4 md:pb-6 lg:pb-8`}
                >
                  <Link href="/collections">
                    <button
                      className={`w-full min-w-[180px] md:min-w-[190px] lg:min-w-[200px] h-[44px] md:h-[46px] lg:h-[48px] px-5 md:px-6 py-2.5 md:py-3 ${COMMON_CLASSES.primaryButton}`}
                    >
                      <span className="text-[13px] md:text-[13.5px] lg:text-[14px] font-medium leading-[22px] md:leading-[23px] lg:leading-[24px] uppercase text-white whitespace-nowrap">
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
