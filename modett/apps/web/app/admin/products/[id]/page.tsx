"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Plus,
  Package,
  Image as ImageIcon,
  Settings,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import {
  getProductById,
  getVariants,
  deleteVariant,
  getCategories,
  ProductFormModal,
} from "@/features/admin";
import { VariantsTable } from "@/features/admin/products/components/variants-table";
import { VariantFormModal } from "@/features/admin/products/components/variant-form-modal";
import type { ProductVariant } from "@/features/admin/products/types/product.types";
import { toast } from "sonner";
import { DashboardHeader } from "@/features/admin";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [activeTab, setActiveTab] = useState("overview");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Variant Modal State
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );

  // Fetch Product
  const {
    data: productResponse,
    isLoading: isLoadingProduct,
    refetch: refetchProduct,
  } = useQuery({
    queryKey: ["admin-product", productId],
    queryFn: () => getProductById(productId),
    enabled: !!productId,
  });

  // Fetch Variants
  const {
    data: variantsResponse,
    isLoading: isLoadingVariants,
    refetch: refetchVariants,
  } = useQuery({
    queryKey: ["admin-product-variants", productId],
    queryFn: () => getVariants(productId),
    enabled: !!productId,
  });

  // Fetch Categories
  const { data: categoriesResponse } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => getCategories(),
  });

  const product = productResponse?.data;
  const variants = variantsResponse?.data || [];
  const categories = categoriesResponse?.data || [];

  const handleEditProduct = () => {
    setIsProductModalOpen(true);
  };

  const handleCreateVariant = () => {
    setSelectedVariant(null);
    setIsVariantModalOpen(true);
  };

  const handleEditVariant = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setIsVariantModalOpen(true);
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (confirm("Are you sure you want to delete this variant?")) {
      const res = await deleteVariant(variantId);
      if (res.success) {
        toast.success("Variant deleted successfully");
        refetchVariants();
      } else {
        toast.error(res.error || "Failed to delete variant");
      }
    }
  };

  const handleProductSaved = () => {
    refetchProduct();
    setIsProductModalOpen(false);
  };

  const handleVariantSaved = () => {
    refetchVariants();
    // Also refetch product as it might update inventory counts or price ranges
    refetchProduct();
    setIsVariantModalOpen(false);
  };

  if (isLoadingProduct) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-gray-500">Product not found</p>
        <Link
          href="/admin/products"
          className="text-blue-600 hover:underline flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mb-20">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link
          href="/admin/products"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Products
        </Link>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1
              className="text-2xl font-bold text-[#232D35]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {product.title}
            </h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                  product.status === "published"
                    ? "bg-green-100 text-green-800"
                    : product.status === "scheduled"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {product.status}
              </span>
              <span>{product.brand}</span>
              <span>•</span>
              <span className="font-mono text-xs text-gray-400">
                {product.productId}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleEditProduct}
              className="px-4 py-2 bg-white border border-[#BBA496]/50 text-[#232D35] rounded-xl hover:bg-[#F8F5F2] transition-all text-sm font-medium"
            >
              Edit Product
            </button>
            <a
              href={`/product/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#232D35] text-white rounded-xl hover:bg-black transition-all text-sm font-medium"
            >
              View on Store
            </a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#BBA496]/20">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("overview")}
            className={`${
              activeTab === "overview"
                ? "border-[#232D35] text-[#232D35]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            <Package className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("variants")}
            className={`${
              activeTab === "variants"
                ? "border-[#232D35] text-[#232D35]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            <Settings className="w-4 h-4" />
            Variants
            <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs ml-1">
              {variants.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("media")}
            className={`${
              activeTab === "media"
                ? "border-[#232D35] text-[#232D35]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            <ImageIcon className="w-4 h-4" />
            Media
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === "overview" && (
          <div className="bg-white p-6 rounded-xl border border-[#BBA496]/30 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3
                  className="text-lg font-medium text-[#232D35] mb-4"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  Description
                </h3>
                <div
                  className="prose prose-sm max-w-none text-gray-600"
                  dangerouslySetInnerHTML={{
                    __html:
                      product.longDescHtml ||
                      product.shortDesc ||
                      "No description provided.",
                  }}
                />
              </div>
              <div className="space-y-6">
                <div>
                  <h3
                    className="text-lg font-medium text-[#232D35] mb-4"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    Details
                  </h3>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        Status
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 capitalize">
                        {product.status}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        Created At
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        Country of Origin
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {product.countryOfOrigin || "-"}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h3
                    className="text-lg font-medium text-[#232D35] mb-4"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    SEO
                  </h3>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        SEO Title
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {product.seoTitle || "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        SEO Description
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {product.seoDescription || "-"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "variants" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3
                className="text-lg font-medium text-[#232D35]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Product Variants
              </h3>
              <button
                onClick={handleCreateVariant}
                className="flex items-center gap-2 px-4 py-2 bg-[#232D35] text-white rounded-lg hover:bg-black transition-all text-sm font-medium shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Variant
              </button>
            </div>

            <VariantsTable
              variants={variants}
              isLoading={isLoadingVariants}
              onEdit={handleEditVariant}
              onDelete={handleDeleteVariant}
            />
          </div>
        )}

        {activeTab === "media" && (
          <div className="bg-white p-12 rounded-xl border border-[#BBA496]/30 shadow-sm text-center">
            <ImageIcon className="w-12 h-12 text-[#BBA496] mx-auto mb-4" />
            <h3
              className="text-lg font-medium text-[#232D35] mb-2"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Media Management
            </h3>
            <p className="text-gray-500">
              Media management coming soon. Use the main Product Edit form to
              manage images for now.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <ProductFormModal
        product={product}
        isOpen={isProductModalOpen}
        categories={categories}
        onClose={() => setIsProductModalOpen(false)}
        onSaved={handleProductSaved}
      />

      <VariantFormModal
        isOpen={isVariantModalOpen}
        onClose={() => setIsVariantModalOpen(false)}
        onSaved={handleVariantSaved}
        productId={productId}
        variant={selectedVariant}
      />
    </div>
  );
}
