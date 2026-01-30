"use client";

import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createVariant, updateVariant } from "../api/products.api";
import type {
  ProductVariant,
  CreateVariantRequest,
} from "../types/product.types";
import { addStock, getLocations } from "../../inventory/api/inventory.api";
import type { StockLocation } from "../../inventory/types/inventory.types";

interface VariantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  productId: string;
  variant?: ProductVariant | null;
}

export function VariantFormModal({
  isOpen,
  onClose,
  onSaved,
  productId,
  variant,
}: VariantFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!variant;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<
    CreateVariantRequest & { initialStock?: number; locationId?: string }
  >({
    defaultValues: {
      sku: "",
      price: 0,
      size: "",
      color: "",
      barcode: "",
      weightG: 0,
      initialStock: 0,
    } as any,
  });

  const [locations, setLocations] = useState<StockLocation[]>([]);

  useEffect(() => {
    // Fetch locations for stock entry
    const fetchLocations = async () => {
      const response = await getLocations();
      if (response.success && response.data.locations.length > 0) {
        setLocations(response.data.locations);
        // Default to first location (usually Warehouse or Main Store)
        setValue("locationId", response.data.locations[0].locationId);
      }
    };
    fetchLocations();
  }, [setValue]);

  useEffect(() => {
    if (variant) {
      reset({
        sku: variant.sku,
        price: variant.price,
        size: variant.size || "",
        color: variant.color || "",
        barcode: variant.barcode || "",
        weightG: variant.weightG || 0,
        compareAtPrice: variant.compareAtPrice || 0,
      });
    } else {
      reset({
        sku: "",
        price: 0,
        size: "",
        color: "",
        barcode: "",
        weightG: 0,
        compareAtPrice: 0,
        initialStock: 0, // Reset stock field
      });
    }
  }, [variant, isOpen, reset]);

  const onSubmit = async (data: CreateVariantRequest) => {
    if (!productId) return;

    setIsSubmitting(true);
    try {
      // Ensure numeric values
      const payload = {
        ...data,
        price: Number(data.price),
        weightG: Number(data.weightG),
        compareAtPrice: data.compareAtPrice
          ? Number(data.compareAtPrice)
          : undefined,
      };

      if (isEditing && variant) {
        const response = await updateVariant(variant.id, payload);
        if (response.success) {
          toast.success("Variant updated successfully");
          onSaved();
          onClose();
        } else {
          toast.error(response.error || "Failed to update variant");
        }
      } else {
        const response = await createVariant(productId, payload);
        if (response.success && response.data) {
          // If initial stock provided, add it now
          // We need the new variant ID from response.data.id
          const newVariantId = response.data.id;
          const initialStock = parseInt(
            (data as any).initialStock as string,
            10,
          );
          const locationId = (data as any).locationId;

          if (initialStock > 0 && locationId && newVariantId) {
            try {
              await addStock({
                variantId: newVariantId,
                locationId: locationId,
                quantity: initialStock,
                reason: "adjustment",
              });
              toast.success("Variant created and stock added");
            } catch (stockError) {
              console.error("Failed to add initial stock", stockError);
              toast.warning("Variant created but failed to add initial stock");
            }
          } else {
            toast.success("Variant created successfully");
          }

          onSaved();
          onClose();
        } else {
          toast.error(response.error || "Failed to create variant");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        {/* Modal Panel */}
        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-xl bg-[#FAF9F6] text-left shadow-2xl transition-all border border-[#BBA496]/30">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-6 py-6 sm:px-8">
              <div className="flex justify-between items-start mb-6">
                <h3
                  className="text-2xl font-bold text-[#232D35]"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {isEditing ? "Edit Variant" : "Add New Variant"}
                </h3>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                  onClick={onClose}
                >
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Price & identifying Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#232D35]">
                      Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        {...register("price", {
                          required: "Price is required",
                          min: 0,
                        })}
                        className="w-full pl-8 pr-4 py-2 border border-[#BBA496]/50 rounded-lg focus:ring-[#BBA496] focus:border-[#BBA496] bg-white text-[#232D35] transition-shadow duration-200"
                        placeholder="0.00"
                      />
                    </div>
                    {errors.price && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.price.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#232D35]">
                      Compare at Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        {...register("compareAtPrice", { min: 0 })}
                        className="w-full pl-8 pr-4 py-2 border border-[#BBA496]/50 rounded-lg focus:ring-[#BBA496] focus:border-[#BBA496] bg-white text-[#232D35] transition-shadow duration-200"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#232D35]">
                      SKU *
                    </label>
                    <input
                      type="text"
                      {...register("sku", { required: "SKU is required" })}
                      className="w-full px-4 py-2 border border-[#BBA496]/50 rounded-lg focus:ring-[#BBA496] focus:border-[#BBA496] bg-white text-[#232D35] transition-shadow duration-200"
                      placeholder="e.g. TSHIRT-BLK-S"
                    />
                    {errors.sku && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.sku.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#232D35]">
                      Barcode (ISBN, UPC, GTIN)
                    </label>
                    <input
                      type="text"
                      {...register("barcode")}
                      className="w-full px-4 py-2 border border-[#BBA496]/50 rounded-lg focus:ring-[#BBA496] focus:border-[#BBA496] bg-white text-[#232D35] transition-shadow duration-200"
                      placeholder=""
                    />
                  </div>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#232D35]">
                      Size
                    </label>
                    <input
                      type="text"
                      {...register("size")}
                      className="w-full px-4 py-2 border border-[#BBA496]/50 rounded-lg focus:ring-[#BBA496] focus:border-[#BBA496] bg-white text-[#232D35] transition-shadow duration-200"
                      placeholder="e.g. Small, 42, 10"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#232D35]">
                      Color
                    </label>
                    <input
                      type="text"
                      {...register("color")}
                      className="w-full px-4 py-2 border border-[#BBA496]/50 rounded-lg focus:ring-[#BBA496] focus:border-[#BBA496] bg-white text-[#232D35] transition-shadow duration-200"
                      placeholder="e.g. Navy Blue, #000080"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#232D35]">
                    Weight (g)
                  </label>
                  <input
                    type="number"
                    {...register("weightG", { min: 0 })}
                    className="w-full px-4 py-2 border border-[#BBA496]/50 rounded-lg focus:ring-[#BBA496] focus:border-[#BBA496] bg-white text-[#232D35] transition-shadow duration-200"
                    placeholder="0"
                  />
                </div>

                {/* Initial Stock (Only for new variants) */}
                {!isEditing && (
                  <div className="pt-4 border-t border-[#BBA496]/20">
                    <h4
                      className="text-sm font-semibold text-[#8B7355] mb-4 uppercase tracking-wider"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                    >
                      Initial Inventory
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-[#232D35]">
                          Initial Stock
                        </label>
                        <input
                          type="number"
                          {...register("initialStock", { min: 0 })}
                          className="w-full px-4 py-2 border border-[#BBA496]/50 rounded-lg focus:ring-[#BBA496] focus:border-[#BBA496] bg-white text-[#232D35] transition-shadow duration-200"
                          placeholder="0"
                        />
                        <p className="text-xs text-gray-500">
                          Quantity available for sale immediately.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-[#232D35]">
                          Location
                        </label>
                        <select
                          {...register("locationId")}
                          className="w-full px-4 py-2 border border-[#BBA496]/50 rounded-lg focus:ring-[#BBA496] focus:border-[#BBA496] bg-white text-[#232D35] transition-shadow duration-200"
                        >
                          {locations.map((loc) => (
                            <option key={loc.locationId} value={loc.locationId}>
                              {loc.name} ({loc.type})
                            </option>
                          ))}
                          {locations.length === 0 && (
                            <option value="" disabled>
                              No locations found
                            </option>
                          )}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#F8F5F2] px-6 py-4 flex flex-row-reverse gap-3 border-t border-[#BBA496]/20">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center rounded-lg bg-[#232D35] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Variant"
                )}
              </button>
              <button
                type="button"
                className="inline-flex justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-[#BBA496]/30 hover:bg-gray-50 transition-all"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
