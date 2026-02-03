"use client";

import { useState, useEffect, useRef } from "react";
import { X, Trash2, Save, Plus, ChevronDown } from "lucide-react";
import type {
  AdminProduct,
  CreateProductRequest,
  UpdateProductRequest,
  ProductCategory,
} from "@/features/admin";
import { createProduct, updateProduct, deleteProduct } from "@/features/admin";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface ProductFormModalProps {
  product: AdminProduct | null; // null = Add mode, not null = Edit mode
  isOpen: boolean;
  categories: ProductCategory[];
  onClose: () => void;
  onSaved?: () => void;
}

// ============================================================================
// PRODUCT FORM MODAL COMPONENT
// ============================================================================

export function ProductFormModal({
  product,
  isOpen,
  categories,
  onClose,
  onSaved,
}: ProductFormModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    brand: "",
    shortDesc: "",
    longDescHtml: "",
    status: "draft" as "draft" | "published" | "scheduled",
    publishAt: "",
    categoryIds: [] as string[],
    countryOfOrigin: "",
    seoTitle: "",
    seoDescription: "",
  });

  // Load product data when editing
  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || "",
        brand: product.brand || "",
        shortDesc: product.shortDesc || "",
        longDescHtml: product.longDescHtml || "",
        status: product.status || "draft",
        publishAt: product.publishAt
          ? new Date(product.publishAt).toISOString().slice(0, 16)
          : "",
        categoryIds: product.categories?.map((c) => c.id) || [],
        countryOfOrigin: product.countryOfOrigin || "",
        seoTitle: product.seoTitle || "",
        seoDescription: product.seoDescription || "",
      });
    } else {
      // Reset form for add mode
      setFormData({
        title: "",
        brand: "",
        shortDesc: "",
        longDescHtml: "",
        status: "draft",
        publishAt: "",
        categoryIds: [],
        countryOfOrigin: "",
        seoTitle: "",
        seoDescription: "",
      });
    }
    setError(null);
    setShowDeleteConfirm(false);
  }, [product, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setIsStatusDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isOpen) return null;

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter((id) => id !== categoryId)
        : [...prev.categoryIds, categoryId],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      let result;

      if (product) {
        // Update existing product
        const updateData: UpdateProductRequest = {
          title: formData.title,
          brand: formData.brand || undefined,
          shortDesc: formData.shortDesc || undefined,
          longDescHtml: formData.longDescHtml || undefined,
          status: formData.status,
          publishAt:
            formData.status === "scheduled" && formData.publishAt
              ? new Date(formData.publishAt).toISOString()
              : undefined,
          countryOfOrigin: formData.countryOfOrigin || undefined,
          seoTitle: formData.seoTitle || undefined,
          seoDescription: formData.seoDescription || undefined,
        };
        result = await updateProduct(product.productId, updateData);
      } else {
        // Create new product
        const createData: CreateProductRequest = {
          title: formData.title,
          brand: formData.brand || undefined,
          shortDesc: formData.shortDesc || undefined,
          longDescHtml: formData.longDescHtml || undefined,
          status: formData.status,
          publishAt:
            formData.status === "scheduled" && formData.publishAt
              ? new Date(formData.publishAt).toISOString()
              : undefined,
          categoryIds:
            formData.categoryIds.length > 0 ? formData.categoryIds : undefined,
          countryOfOrigin: formData.countryOfOrigin || undefined,
          seoTitle: formData.seoTitle || undefined,
          seoDescription: formData.seoDescription || undefined,
        };
        result = await createProduct(createData);
      }

      if (result.success) {
        onSaved?.();
        onClose();
      } else {
        setError(result.error || "Failed to save product");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;

    setIsDeleting(true);
    try {
      const result = await deleteProduct(product.productId);
      if (result.success) {
        onSaved?.();
        onClose();
      } else {
        setError(result.error || "Failed to delete product");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while deleting");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-[#F8F5F2] rounded-2xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#BBA496]/20">
            <div>
              <h2
                className="text-2xl font-normal text-[#232D35]"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                {product ? "Edit Product" : "Add New Product"}
              </h2>
              <p
                className="text-sm text-[#A09B93] mt-1"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                {product
                  ? "Update product information"
                  : "Create a new product in your catalog"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#A09B93] hover:text-[#232D35] hover:bg-[#F8F5F2] rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(100vh-250px)] overflow-y-auto">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3
                  className="text-lg font-medium text-[#232D35] mb-4"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-[#232D35] mb-2"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                    >
                      Product Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-[#BBA496] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BBA496]/20 focus:border-[#BBA496]"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                      placeholder="Enter product title"
                    />
                  </div>

                  {/* Brand */}
                  <div>
                    <label
                      htmlFor="brand"
                      className="block text-sm font-medium text-[#232D35] mb-2"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                    >
                      Brand
                    </label>
                    <input
                      id="brand"
                      name="brand"
                      type="text"
                      value={formData.brand}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-[#BBA496] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BBA496]/20 focus:border-[#BBA496]"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                      placeholder="Enter brand name"
                    />
                  </div>

                  {/* Status - Custom Dropdown */}
                  <div>
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium text-[#232D35] mb-2"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                    >
                      Status
                    </label>
                    <div className="relative" ref={statusDropdownRef}>
                      <button
                        type="button"
                        onClick={() =>
                          setIsStatusDropdownOpen(!isStatusDropdownOpen)
                        }
                        className="w-full px-4 py-2 border border-[#BBA496] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BBA496]/20 focus:border-[#BBA496] bg-white text-[#232D35] cursor-pointer hover:border-[#BBA496]/80 transition-colors text-left flex items-center justify-between"
                        style={{ fontFamily: "Raleway, sans-serif" }}
                      >
                        <span className="capitalize">{formData.status}</span>
                        <ChevronDown
                          className={`w-5 h-5 text-[#BBA496] transition-transform ${isStatusDropdownOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      {isStatusDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-[#BBA496] rounded-lg shadow-lg overflow-hidden">
                          {["draft", "published", "scheduled", "archived"].map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  status: status as any,
                                }));
                                setIsStatusDropdownOpen(false);
                              }}
                              className={`w-full px-4 py-2.5 text-left hover:bg-[#F8F5F2] transition-colors ${
                                formData.status === status
                                  ? "bg-[#BBA496] text-white hover:bg-[#BBA496]/90"
                                  : "text-[#232D35]"
                              }`}
                              style={{ fontFamily: "Raleway, sans-serif" }}
                            >
                              <span className="capitalize">{status}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Publish At (shown only for scheduled status) */}
                  {formData.status === "scheduled" && (
                    <div>
                      <label
                        htmlFor="publishAt"
                        className="block text-sm font-medium text-[#232D35] mb-2"
                        style={{ fontFamily: "Raleway, sans-serif" }}
                      >
                        Publish Date & Time{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="publishAt"
                        name="publishAt"
                        type="datetime-local"
                        required
                        value={formData.publishAt}
                        onChange={handleInputChange}
                        min={new Date().toISOString().slice(0, 16)}
                        className="w-full px-4 py-2 border border-[#BBA496] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BBA496]/20 focus:border-[#BBA496]"
                        style={{ fontFamily: "Raleway, sans-serif" }}
                      />
                      <p className="text-xs text-[#A09B93] mt-1">
                        Select a future date and time for publication
                      </p>
                    </div>
                  )}

                  {/* Short Description */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="shortDesc"
                      className="block text-sm font-medium text-[#232D35] mb-2"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                    >
                      Short Description
                    </label>
                    <textarea
                      id="shortDesc"
                      name="shortDesc"
                      rows={3}
                      value={formData.shortDesc}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-[#BBA496] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BBA496]/20 focus:border-[#BBA496]"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                      placeholder="Brief description of the product"
                    />
                  </div>

                  {/* Long Description */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="longDescHtml"
                      className="block text-sm font-medium text-[#232D35] mb-2"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                    >
                      Detailed Description
                    </label>
                    <textarea
                      id="longDescHtml"
                      name="longDescHtml"
                      rows={6}
                      value={formData.longDescHtml}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-[#BBA496] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BBA496]/20 focus:border-[#BBA496]"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                      placeholder="Full product description (HTML supported)"
                    />
                  </div>
                </div>
              </div>

              {/* Categories */}
              {categories && categories.length > 0 && (
                <div>
                  <h3
                    className="text-lg font-medium text-[#232D35] mb-4"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    Categories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => handleCategoryToggle(category.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                          formData.categoryIds.includes(category.id)
                            ? "bg-[#232D35] text-white border-[#232D35]"
                            : "bg-[#F8F5F2] text-[#232D35] border-[#BBA496] hover:bg-[#BBA496]/20"
                        }`}
                        style={{ fontFamily: "Raleway, sans-serif" }}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Details */}
              <div>
                <h3
                  className="text-lg font-medium text-[#232D35] mb-4"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  Additional Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Country of Origin */}
                  <div>
                    <label
                      htmlFor="countryOfOrigin"
                      className="block text-sm font-medium text-[#232D35] mb-2"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                    >
                      Country of Origin
                    </label>
                    <input
                      id="countryOfOrigin"
                      name="countryOfOrigin"
                      type="text"
                      value={formData.countryOfOrigin}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-[#BBA496] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BBA496]/20 focus:border-[#BBA496]"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                      placeholder="e.g., USA, China"
                    />
                  </div>

                  {/* SEO Title */}
                  <div>
                    <label
                      htmlFor="seoTitle"
                      className="block text-sm font-medium text-[#232D35] mb-2"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                    >
                      SEO Title
                    </label>
                    <input
                      id="seoTitle"
                      name="seoTitle"
                      type="text"
                      value={formData.seoTitle}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-[#BBA496] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BBA496]/20 focus:border-[#BBA496]"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                      placeholder="SEO optimized title"
                    />
                  </div>

                  {/* SEO Description */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="seoDescription"
                      className="block text-sm font-medium text-[#232D35] mb-2"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                    >
                      SEO Description
                    </label>
                    <textarea
                      id="seoDescription"
                      name="seoDescription"
                      rows={3}
                      value={formData.seoDescription}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-[#BBA496] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BBA496]/20 focus:border-[#BBA496]"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                      placeholder="Meta description for search engines"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[#BBA496]/20 bg-white/50">
            {showDeleteConfirm ? (
              // Delete confirmation mode - full width centered layout
              <div className="flex flex-col items-center gap-4">
                <p
                  className="text-sm text-red-700 font-medium text-center"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  Are you sure you want to delete this product? This action
                  cannot be undone.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="min-w-[140px] px-6 py-2.5 bg-white border border-[#BBA496] text-[#232D35] text-sm font-medium rounded-lg hover:bg-[#BBA496]/10 transition-all shadow-sm disabled:opacity-50"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="min-w-[140px] px-6 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    {isDeleting ? "Deleting..." : "Yes, Delete"}
                  </button>
                </div>
              </div>
            ) : (
              // Normal mode - left/right layout
              <div className="flex items-center justify-between">
                <div>
                  {product && (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-2 min-w-[140px] px-6 py-2.5 bg-white border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 hover:border-red-400 transition-all shadow-sm"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Product
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    className="min-w-[140px] px-6 py-2.5 bg-white border border-[#BBA496] text-[#232D35] text-sm font-medium rounded-lg hover:bg-[#BBA496]/10 transition-all shadow-sm"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={
                      isSaving ||
                      !formData.title ||
                      (formData.status === "scheduled" && !formData.publishAt)
                    }
                    className="flex items-center gap-2 min-w-[140px] px-6 py-2.5 bg-[#232D35] text-white text-sm font-medium rounded-lg hover:bg-black transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    <Save className="w-4 h-4" />
                    {isSaving
                      ? "Saving..."
                      : product
                        ? "Save Changes"
                        : "Create Product"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
