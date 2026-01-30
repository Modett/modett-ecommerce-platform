"use client";

import { useState, useEffect } from "react";
import { X, Loader2, PackagePlus } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getLocations, addStock, getProducts } from "@/features/admin";
import type { StockLocation, AdminProduct } from "@/features/admin";

interface ReceivingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReceivingModal({
  isOpen,
  onClose,
  onSuccess,
}: ReceivingModalProps) {
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState<"return" | "adjustment" | "po">("po");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch products (for variant selection)
  // In a real app with many products, this should be an async search.
  // For MVP, we fetch the first page/limit.
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["admin-products-select"],
    queryFn: () => getProducts({ limit: 100 }), // Fetch more for selection
    enabled: isOpen,
  });

  // Fetch locations
  const { data: locationsData, isLoading: isLoadingLocations } = useQuery({
    queryKey: ["admin-locations-select"],
    queryFn: () => getLocations(),
    enabled: isOpen,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariantId || !selectedLocationId) {
      setError("Please select a product and location");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const result = await addStock({
        variantId: selectedVariantId,
        locationId: selectedLocationId,
        quantity: quantity,
        reason: reason,
      });

      if (result.success) {
        onSuccess();
        onClose();
        setQuantity(1);
        setReason("po");
        setSelectedVariantId("");
      } else {
        setError(result.error || "Failed to add stock");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const allVariants =
    (productsData as any)?.data?.products?.flatMap((p: AdminProduct) =>
      p.variants.map((v) => ({
        ...v,
        productTitle: p.title,
        productId: p.productId,
      }))
    ) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#F8F5F2] rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#BBA496]/20 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#232D35] flex items-center justify-center">
              <PackagePlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2
                className="text-xl font-medium text-[#232D35]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Receive Inventory
              </h2>
              <p className="text-sm text-[#8B7355]">
                Add new stock to inventory
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#A09B93] hover:text-[#232D35] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form
            id="receiving-form"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Location Select */}
            <div>
              <label className="block text-sm font-medium text-[#232D35] mb-1">
                Location
              </label>
              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                className="w-full h-11 px-4 bg-white border border-[#BBA496]/30 rounded-xl focus:ring-1 focus:ring-[#BBA496] focus:border-[#BBA496] outline-none transition-all"
                disabled={isLoadingLocations}
                required
              >
                <option value="">Select Location</option>
                {isLoadingLocations ? (
                  <option>Loading locations...</option>
                ) : (
                  locationsData?.data?.locations?.map((loc: StockLocation) => (
                    <option key={loc.locationId} value={loc.locationId}>
                      {loc.name} ({loc.type})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Product Variant Select */}
            <div>
              <label className="block text-sm font-medium text-[#232D35] mb-1">
                Product Variant
              </label>
              <select
                value={selectedVariantId}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                className="w-full h-11 px-4 bg-white border border-[#BBA496]/30 rounded-xl focus:ring-1 focus:ring-[#BBA496] focus:border-[#BBA496] outline-none transition-all"
                disabled={isLoadingProducts}
                required
              >
                <option value="">Select Product Variant</option>
                {isLoadingProducts ? (
                  <option>Loading products...</option>
                ) : (
                  allVariants.map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {v.productTitle} - {v.sku} (
                      {Object.values(v.attributes || {}).join("/")})
                    </option>
                  ))
                )}
              </select>
              <p className="mt-1 text-xs text-[#8B7355]">
                Only referencing the first 100 products. Search coming soon.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-[#232D35] mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  className="w-full h-11 px-4 bg-white border border-[#BBA496]/30 rounded-xl focus:ring-1 focus:ring-[#BBA496] focus:border-[#BBA496] outline-none transition-all"
                  required
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-[#232D35] mb-1">
                  Reason
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as any)}
                  className="w-full h-11 px-4 bg-white border border-[#BBA496]/30 rounded-xl focus:ring-1 focus:ring-[#BBA496] focus:border-[#BBA496] outline-none transition-all"
                >
                  <option value="po">Purchase Order (PO)</option>
                  <option value="return">Return (RMA)</option>
                  <option value="adjustment">Adjustment (Found)</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#BBA496]/20 bg-white flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-[#BBA496]/50 text-[#232D35] rounded-xl hover:bg-[#F8F5F2] transition-colors font-medium"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="receiving-form"
            className="px-5 py-2.5 bg-[#232D35] text-white rounded-xl hover:bg-black transition-all shadow-md font-medium flex items-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Confirm Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
