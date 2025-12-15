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
          <PageContainer className="px-4 md:px-8 lg:px-16 pt-4 pb-0 md:py-8 lg:py-[64px]">
            {/* Cart Title */}
            <div className="pb-[24px] mb-0 border-b border-[#D2D2D2] lg:border-0 lg:pb-0 lg:mb-[48px]">
              <h1
                className="text-[14px] md:text-[15px] lg:text-[16px] leading-[20px] lg:leading-[24px] font-medium tracking-[3px] md:tracking-[3.5px] lg:tracking-[4px] text-center lg:text-left"
                style={{ fontFamily: "Raleway, sans-serif", color: "#765C4D" }}
              >
                <span className="lg:hidden">
                  Cart ({cart.items.length}{" "}
                  {cart.items.length === 1 ? "product" : "products"})
                </span>
                <span className="hidden lg:inline uppercase">CART</span>
              </h1>
            </div>

            <div
              className={`flex flex-col lg:flex-row ${RESPONSIVE.gap.section} lg:items-start`}
            >
              <div
                className={`${RESPONSIVE.cartTable.mobile} ${RESPONSIVE.cartTable.tablet} ${RESPONSIVE.cartTable.desktop}`}
              >
                <div
                  className={`hidden lg:flex h-[48px] md:h-[52px] lg:h-[56px] px-3 md:px-4 lg:px-[16px] items-center ${RESPONSIVE.gap.item} border-b ${COMMON_CLASSES.borderLight} ${COMMON_CLASSES.cartItemBg}`}
                >
                  <div className="w-[120px] md:w-[135px] lg:w-[149.61px]">
                    <Text.TableHeader className="text-[12px] md:text-[13px] lg:text-[14px] leading-[20px] md:leading-[22px] lg:leading-[24px] font-normal tracking-[0.8px] md:tracking-[0.9px] lg:tracking-[1.03px]">
                      Product
                    </Text.TableHeader>
                  </div>
                  <div className="flex-1 md:w-[280px] lg:w-[342.02px] pl-3 md:pl-4 lg:pl-[20px]">
                    <Text.TableHeader className="text-[12px] md:text-[13px] lg:text-[14px] leading-[20px] md:leading-[22px] lg:leading-[24px] font-normal tracking-[0.8px] md:tracking-[0.9px] lg:tracking-[1.03px]">
                      Description
                    </Text.TableHeader>
                  </div>
                  <div className="w-[60px] md:w-[65px] lg:w-[70px] pr-2 md:pr-3 lg:pr-[14.8px] flex justify-center">
                    <Text.TableHeader className="text-[12px] md:text-[13px] lg:text-[14px] leading-[20px] md:leading-[22px] lg:leading-[24px] font-normal tracking-[0.8px] md:tracking-[0.9px] lg:tracking-[1.03px]">
                      Quantity
                    </Text.TableHeader>
                  </div>
                  <div className="w-[90px] md:w-[100px] lg:w-[112px] flex items-center justify-end">
                    <Text.TableHeader className="text-[12px] md:text-[13px] lg:text-[14px] leading-[20px] md:leading-[22px] lg:leading-[24px] font-normal tracking-[0.8px] md:tracking-[0.9px] lg:tracking-[1.03px]">
                      Price
                    </Text.TableHeader>
                  </div>
                </div>

                {/* Cart Items */}
                <div className="flex flex-col divide-y divide-[#E5E0D6] md:divide-none gap-0 md:gap-5 lg:gap-[24px] pt-[24px] md:pt-5 lg:pt-[24px]">
                  {cart.items.map((item, index) => {
                    const slug = item.product?.slug || "";
                    return (
                      <CartItem
                        key={item.id || item.cartItemId || `cart-item-${index}`}
                        cartItemId={item.variantId}
                        productId={item.product?.productId || item.variantId}
                        sku={item.variant?.sku}
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
              className={`w-full ${COMMON_CLASSES.pageBg} pb-8 sm:py-12 md:py-16 lg:py-20 xl:py-[64px]`}
            >
              <PageContainer>
                <Text.PageTitle
                  className="w-full max-w-[302px] lg:max-w-none mx-auto text-[20px] md:text-[22px] lg:text-[24px] leading-[140%] md:leading-[30px] lg:leading-[32px] font-normal mb-[24px] md:mb-10 lg:mb-[48px] text-center"
                  style={{
                    fontFamily: "Raleway, sans-serif",
                    color: "#765C4D",
                  }}
                >
                  You may also be interested in
                </Text.PageTitle>

                <ProductGrid
                  products={recommendedProducts.slice(0, 6)}
                  className="mx-auto max-w-[350px] md:max-w-none"
                />

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
