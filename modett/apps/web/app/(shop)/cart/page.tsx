"use client";

import Link from "next/link";
import { CartItem } from "@/features/cart/components/cart-item";
import { OrderSummary } from "@/features/cart/components/order-summary";
import { COMMON_CLASSES, RESPONSIVE } from "@/features/cart/constants/styles";
import {
  useUpdateCartQuantity,
  useRemoveCartItem,
} from "@/features/cart/queries";
import { useFeaturedProducts } from "@/features/product-catalog/queries";
import { PageContainer } from "@/components/layout/page-container";
import { useCheckoutCart } from "@/features/checkout/hooks/use-checkout-cart";
import { LoadingState } from "@/features/checkout/components/loading-state";
import { Text } from "@/components/ui/text";
import { ViewMoreSection } from "@/features/product-catalog/components/view-more-section";
import { ProductGrid } from "@/features/product-catalog/components/product-grid";

export default function CartPage() {
  const { cart, isLoading, cartId } = useCheckoutCart();
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
    return <LoadingState message="Loading cart..." />;
  }

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  return (
    <main className={`w-full ${COMMON_CLASSES.pageBg}`}>
      {isEmpty ? (
        <div className={`${COMMON_CLASSES.responsiveContainer} py-[80px]`}>
          <div className="text-center">
            <Text.PageTitle className="text-[32px] leading-[40px] font-medium mb-[24px]">
              Your cart is empty
            </Text.PageTitle>
            <Text.BodySlate className="text-[16px] leading-[24px] font-normal mb-[32px]">
              Discover our collections and find something you love.
            </Text.BodySlate>
            <Link href="/collections">
              <Text.Button
                as="span"
                className={`inline-block px-[32px] py-[12px] ${COMMON_CLASSES.primaryButton} text-[14px] font-medium`}
              >
                CONTINUE SHOPPING
              </Text.Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <PageContainer className={RESPONSIVE.padding.section}>
            {/* Cart Label */}
            <div className="h-[24px] mb-8 md:mb-10 lg:mb-[48px]">
              <Text.Accent className="text-[14px] md:text-[15px] lg:text-[16px] leading-[24px] font-medium uppercase tracking-[3px] md:tracking-[3.5px] lg:tracking-[4px]">
                CART
              </Text.Accent>
            </div>

            <div
              className={`flex flex-col lg:flex-row ${RESPONSIVE.gap.section} lg:items-start`}
            >
              <div
                className={`${RESPONSIVE.cartTable.mobile} ${RESPONSIVE.cartTable.tablet} ${RESPONSIVE.cartTable.desktop}`}
              >
                <div
                  className={`flex h-[48px] md:h-[52px] lg:h-[56px] px-3 md:px-4 lg:px-[16px] items-center ${RESPONSIVE.gap.item} border-b ${COMMON_CLASSES.borderLight} ${COMMON_CLASSES.cartItemBg}`}
                >
                  <div className="w-[120px] md:w-[135px] lg:w-[149.61px] h-[21px]">
                    <Text.TableHeader className="text-[12px] md:text-[13px] lg:text-[14px] leading-[20px] md:leading-[22px] lg:leading-[24px] font-normal tracking-[0.8px] md:tracking-[0.9px] lg:tracking-[1.03px]">
                      Product
                    </Text.TableHeader>
                  </div>
                  <div className="flex-1 md:w-[280px] lg:w-[342.02px] h-[24px] pl-3 md:pl-4 lg:pl-[20px]">
                    <Text.TableHeader className="text-[12px] md:text-[13px] lg:text-[14px] leading-[20px] md:leading-[22px] lg:leading-[24px] font-normal tracking-[0.8px] md:tracking-[0.9px] lg:tracking-[1.03px]">
                      Description
                    </Text.TableHeader>
                  </div>
                  <div className="w-[60px] md:w-[65px] lg:w-[70px] h-[21px] pr-2 md:pr-3 lg:pr-[14.8px]">
                    <Text.TableHeader className="text-[12px] md:text-[13px] lg:text-[14px] leading-[20px] md:leading-[22px] lg:leading-[24px] font-normal tracking-[0.8px] md:tracking-[0.9px] lg:tracking-[1.03px] inline-block -ml-[25px] md:-ml-[28px] lg:-ml-[30px]">
                      Quantity
                    </Text.TableHeader>
                  </div>
                  <div className="w-[90px] md:w-[100px] lg:w-[112px] h-[24px] text-right">
                    <Text.TableHeader className="text-[12px] md:text-[13px] lg:text-[14px] leading-[20px] md:leading-[22px] lg:leading-[24px] font-normal tracking-[0.8px] md:tracking-[0.9px] lg:tracking-[1.03px]">
                      Price
                    </Text.TableHeader>
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
              <div
                className={`${RESPONSIVE.orderSummary.mobile} ${RESPONSIVE.orderSummary.desktop} lg:flex-shrink-0`}
              >
                <OrderSummary
                  subtotal={cart.summary.subtotal}
                  discount={cart.summary.discount}
                  total={cart.summary.total}
                />
              </div>
            </div>
          </PageContainer>

          {/* You may also be interested in */}
          {recommendedProducts && recommendedProducts.length > 0 && (
            <section
              className={`w-full ${COMMON_CLASSES.pageBg} ${RESPONSIVE.padding.section}`}
            >
              <PageContainer>
                <Text.PageTitle className="text-[20px] md:text-[22px] lg:text-[24px] leading-[28px] md:leading-[30px] lg:leading-[32px] font-normal mb-8 md:mb-10 lg:mb-[48px]">
                  You may also be interested in
                </Text.PageTitle>

                <ProductGrid products={recommendedProducts.slice(0, 6)} />

                {/* View More Button */}
                <ViewMoreSection />
              </PageContainer>
            </section>
          )}
        </>
      )}
    </main>
  );
}
