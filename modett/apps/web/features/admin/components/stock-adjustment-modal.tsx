"use client";

import { useState, useEffect } from "react";
import { X, Loader2, ClipboardEdit } from "lucide-react";
import { adjustStock } from "../api/inventory.api";
import type { StockItem } from "../types/inventory.types";

interface StockAdjustmentModalProps {
  isOpen: boolean;
  stockItem: StockItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function StockAdjustmentModal({
  isOpen,
  stockItem,
  onClose,
  onSuccess,
}: StockAdjustmentModalProps) {
  const [quantityDelta, setQuantityDelta] = useState(0);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [adjustmentType, setAdjustmentType] = useState<
    "add" | "remove" | "set"
  >("add");
  const [targetQuantity, setTargetQuantity] = useState(0);

  useEffect(() => {
    if (isOpen && stockItem) {
      setQuantityDelta(0);
      setReason("");
      setError("");
      setAdjustmentType("add");
      setTargetQuantity(stockItem.onHand);
    }
  }, [isOpen, stockItem]);

  // Handle calculation logic
  const handleTypeChange = (type: "add" | "remove" | "set") => {
    setAdjustmentType(type);
    if (stockItem) {
      if (type === "set") {
        setTargetQuantity(stockItem.onHand);
        setQuantityDelta(0);
      } else {
        setQuantityDelta(0); // reset delta
      }
    }
  };

  const calculateFinalDelta = () => {
    if (!stockItem) return 0;
    if (adjustmentType === "add") return quantityDelta;
    if (adjustmentType === "remove") return -quantityDelta;
    if (adjustmentType === "set") return targetQuantity - stockItem.onHand;
    return 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockItem) return;

    const finalDelta = calculateFinalDelta();

    if (finalDelta === 0) {
      setError("No change in quantity detected.");
      return;
    }

    if (reason.trim().length < 3) {
      setError("Please provide a valid reason (min 3 chars).");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const result = await adjustStock({
        variantId: stockItem.variantId,
        locationId: stockItem.locationId,
        quantityDelta: finalDelta,
        reason: reason,
      });

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || "Failed to adjust stock");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !stockItem) return null;

  const currentQty = stockItem.onHand;
  const projectedQty = currentQty + calculateFinalDelta();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#F8F5F2] rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#BBA496]/20 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#232D35] flex items-center justify-center">
              <ClipboardEdit className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2
                className="text-xl font-medium text-[#232D35]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Adjust Stock
              </h2>
              <p className="text-sm text-[#8B7355]">
                {stockItem.variant?.product?.title} - {stockItem.location?.name}
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

          <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-xl border border-[#BBA496]/20">
            <div className="text-center">
              <p className="text-xs text-[#8B7355] uppercase tracking-wider font-semibold">
                Current
              </p>
              <p className="text-2xl font-bold text-[#232D35]">{currentQty}</p>
            </div>
            <div className="text-[#BBA496]">→</div>
            <div className="text-center">
              <p className="text-xs text-[#8B7355] uppercase tracking-wider font-semibold">
                New
              </p>
              <p
                className={`text-2xl font-bold ${projectedQty < 0 ? "text-red-600" : "text-[#232D35]"}`}
              >
                {projectedQty}
              </p>
            </div>
          </div>

          <form
            id="adjustment-form"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Adjustment Type Tabs */}
            <div className="flex p-1 bg-white border border-[#BBA496]/30 rounded-xl">
              {(["add", "remove", "set"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeChange(type)}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all capitalize ${
                    adjustmentType === type
                      ? "bg-[#232D35] text-white shadow-sm"
                      : "text-[#8B7355] hover:text-[#232D35]"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Quantity Input */}
            <div>
              <label className="block text-sm font-medium text-[#232D35] mb-1">
                {adjustmentType === "set" ? "New Quantity" : "Quantity Change"}
              </label>
              {adjustmentType === "set" ? (
                <input
                  type="number"
                  min="0"
                  value={targetQuantity}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTargetQuantity(val === "" ? 0 : parseInt(val) || 0);
                  }}
                  className="w-full h-11 px-4 bg-white border border-[#BBA496]/30 rounded-xl focus:ring-1 focus:ring-[#BBA496] focus:border-[#BBA496] outline-none transition-all"
                  required
                />
              ) : (
                <input
                  type="number"
                  min="1"
                  value={quantityDelta || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setQuantityDelta(val === "" ? 0 : parseInt(val) || 0);
                  }}
                  className="w-full h-11 px-4 bg-white border border-[#BBA496]/30 rounded-xl focus:ring-1 focus:ring-[#BBA496] focus:border-[#BBA496] outline-none transition-all"
                  required
                />
              )}
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-[#232D35] mb-1">
                Reason Code
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full h-11 px-4 bg-white border border-[#BBA496]/30 rounded-xl focus:ring-1 focus:ring-[#BBA496] focus:border-[#BBA496] outline-none transition-all"
                required
              >
                <option value="">Select Reason</option>
                <option value="adjustment">General Adjustment</option>
                <option value="correction">Inventory Correction</option>
                <option value="found">Item Found</option>
                <option value="damage">Damaged</option>
                <option value="loss">Lost / Missing</option>
                <option value="shrinkage">Shrinkage</option>
              </select>
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
            form="adjustment-form"
            className="px-5 py-2.5 bg-[#232D35] text-white rounded-xl hover:bg-black transition-all shadow-md font-medium flex items-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Confirm Adjustment
          </button>
        </div>
      </div>
    </div>
  );
}
