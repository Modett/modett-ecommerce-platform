import { useState, useEffect } from "react";
import { getStoredCartId } from "../utils";

export function useCartId() {
  const [cartId, setCartId] = useState<string | null>(null);

  useEffect(() => {
    const updateCartId = () => {
      const storedCartId = getStoredCartId();
      setCartId(storedCartId);
    };

    // Initial load
    updateCartId();

    // Listen for changes
    const handleCartChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      setCartId(customEvent.detail);
    };

    window.addEventListener("cart-id-changed", handleCartChange);

    return () => {
      window.removeEventListener("cart-id-changed", handleCartChange);
    };
  }, []);

  return cartId;
}
