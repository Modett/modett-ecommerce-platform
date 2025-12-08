import { useState, useEffect } from "react";
import { getStoredCartId } from "../utils";

export function useCartId() {
  const [cartId, setCartId] = useState<string | null>(null);

  useEffect(() => {
    const storedCartId = getStoredCartId();
    if (storedCartId) {
      setCartId(storedCartId);
    }
  }, []);

  return cartId;
}
