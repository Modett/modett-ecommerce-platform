import { COMMON_CLASSES, TEXT_STYLES } from "@/features/cart/constants/styles";
import { Cart } from "@/features/cart/types";

interface CartSummaryProps {
  cart: Cart | undefined;
}

export function CartSummary({ cart }: CartSummaryProps) {
  const cartItems = cart?.items || [];
  const subtotal = cart?.summary.subtotal || 0;
  const total = cart?.summary.total || 0;

  return (
    <div className={`${COMMON_CLASSES.pageBg} sticky top-4`}>
      <div className="pt-[26px] px-[34px] pb-[27px] border-b border-[#E5E0D6]">
        <h2
          className="text-base font-medium"
          style={TEXT_STYLES.bodyGraphite}
        >
          Your cart ({cartItems.length} items)
        </h2>
      </div>

      <div className="p-[34px]">
        <div className="mb-6 flex flex-col gap-6">
          {cartItems.map((item, index) => (
            <div
              key={item.id || item.cartItemId || index}
              className="flex gap-[21px]"
            >
              <div className="w-[63px] h-[80.31px] bg-gray-200 flex-shrink-0">
                {item.product?.images?.[0]?.url && (
                  <img
                    src={item.product.images[0].url}
                    alt={item.product?.title || "Product"}
                    className="w-full h-full object-cover object-top"
                  />
                )}
              </div>
              <div className="flex-1 flex flex-col gap-1 min-w-0">
                <h3
                  className=""
                  style={{
                    fontFamily: "Raleway, sans-serif",
                    fontSize: "18px",
                    lineHeight: "28px",
                    fontWeight: 400,
                    color: "#232D35",
                  }}
                >
                  {item.product?.title || "Product"}
                </h3>
                <div className="grid grid-cols-2 items-center w-full">
                  {item.variant?.color && (
                    <p
                      className="whitespace-nowrap"
                      style={{
                        fontFamily: "Raleway, sans-serif",
                        fontSize: "10px",
                        lineHeight: "16px",
                        fontWeight: 400,
                        color: "#232D35",
                      }}
                    >
                      Color: {item.variant.color}
                    </p>
                  )}
                  {item.variant?.size && (
                    <p
                      className="whitespace-nowrap text-right"
                      style={{
                        fontFamily: "Raleway, sans-serif",
                        fontSize: "10px",
                        lineHeight: "16px",
                        fontWeight: 400,
                        color: "#232D35",
                      }}
                    >
                      Size: {item.variant.size}
                    </p>
                  )}
                </div>
                <p
                  style={{
                    fontFamily: "Raleway, sans-serif",
                    fontSize: "10px",
                    lineHeight: "16px",
                    fontWeight: 400,
                    color: "#232D35",
                  }}
                >
                  Rs {item.unitPrice.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div
          className="border-t pt-6 flex flex-col gap-2"
          style={{ borderColor: "#E5E0D6" }}
        >
          <div
            className="flex justify-between items-center border-b pb-[9px]"
            style={{ borderColor: "#E5E0D6" }}
          >
            <span
              style={{
                fontFamily: "Raleway, sans-serif",
                fontSize: "18px",
                lineHeight: "28px",
                fontWeight: 400,
                color: "#232D35",
              }}
            >
              Subtotal
            </span>
            <span
              style={{
                fontFamily: "Raleway, sans-serif",
                fontSize: "14px",
                lineHeight: "24px",
                letterSpacing: "1.03px",
                fontWeight: 400,
                color: "#232D35",
              }}
            >
              Rs {subtotal.toFixed(2)}
            </span>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <span
                style={{
                  fontFamily: "Raleway, sans-serif",
                  fontSize: "12px",
                  lineHeight: "18px",
                  color: "#232D35",
                }}
              >
                Shipping Times and Costs
              </span>
              <span
                style={{
                  fontFamily: "Raleway, sans-serif",
                  fontSize: "14px",
                  color: "#232D35",
                }}
              >
                free
              </span>
            </div>
            <p
              style={{
                fontFamily: "Raleway, sans-serif",
                fontSize: "10px",
                lineHeight: "16px",
                color: "#232D35",
                marginTop: "4px",
              }}
            >
              2 to 3 working days after receipt of order confirmation
            </p>
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="flex items-baseline gap-1">
              <span
                style={{
                  fontFamily: "Raleway, sans-serif",
                  fontSize: "18px",
                  lineHeight: "28px",
                  fontWeight: 400,
                  color: "#232D35",
                }}
              >
                Total
              </span>
              <span
                style={{
                  fontFamily: "Raleway, sans-serif",
                  fontSize: "12px",
                  lineHeight: "18px",
                  fontWeight: 400,
                  color: "#3E5460",
                }}
              >
                Taxes inc.
              </span>
            </div>
            <span
              style={{
                fontFamily: "Raleway, sans-serif",
                fontSize: "20px",
                color: "#232D35",
              }}
            >
              Rs {total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
