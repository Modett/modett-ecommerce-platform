import { useState, useCallback } from "react";

export function useToggleArray<T>(initialValue: T[] = []) {
  const [selectedItems, setSelectedItems] = useState<T[]>(initialValue);

  const toggleItem = useCallback((item: T) => {
    setSelectedItems((prev) => {
      if (prev.includes(item)) {
        return prev.filter((i) => i !== item);
      } else {
        return [...prev, item];
      }
    });
  }, []);

  const clearItems = useCallback(() => {
    setSelectedItems([]);
  }, []);

  return {
    selectedItems,
    setSelectedItems,
    toggleItem,
    clearItems,
  };
}
