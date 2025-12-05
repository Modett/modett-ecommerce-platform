import { useState, useEffect } from "react";
import { useCart } from "@/features/cart/queries";
import { getStoredCartId } from "@/features/cart/utils";

export function useCheckoutCart() {
  const [cartId, setCartId] = useState<string | null>(null);

  useEffect(() => {
    const storedCartId = getStoredCartId();
    if (storedCartId) {
      setCartId(storedCartId);
    }
  }, []);

  const { data: cart, isLoading } = useCart(cartId);

  return {
    cart,
    isLoading,
    cartId,
  };
}
