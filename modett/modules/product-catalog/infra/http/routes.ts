import { FastifyInstance } from "fastify";
import {
  ProductController,
  CategoryController,
  VariantController,
  SearchController,
  MediaController,
  ProductMediaController,
  VariantMediaController,
  ProductTagController,
  SizeGuideController,
  EditorialLookController,
} from "./controllers";
import {
  ProductManagementService,
  CategoryManagementService,
  VariantManagementService,
  MediaAssetManagementService,
  ProductMediaManagementService,
  VariantMediaManagementService,
  ProductTagManagementService,
  SizeGuideManagementService,
  EditorialLookManagementService,
} from "../../application/services";

// Route registration function
export async function registerProductCatalogRoutes(
  fastify: FastifyInstance,
  services: {
    productService: ProductManagementService;
    categoryService: CategoryManagementService;
    variantService: VariantManagementService;
    mediaAssetService: MediaAssetManagementService;
    productMediaService: ProductMediaManagementService;
    variantMediaService: VariantMediaManagementService;
    productTagService: ProductTagManagementService;
    sizeGuideService: SizeGuideManagementService;
    editorialLookService: EditorialLookManagementService;
  }
) {
  // Initialize controllers
  const productController = new ProductController(services.productService);
  const categoryController = new CategoryController(services.categoryService);
  const variantController = new VariantController(services.variantService);
  const searchController = new SearchController(services.productService);
  const mediaController = new MediaController(services.mediaAssetService);
  const productMediaController = new ProductMediaController(services.productMediaService);
  const variantMediaController = new VariantMediaController(services.variantMediaService);
  const productTagController = new ProductTagController(services.productTagService);
  const sizeGuideController = new SizeGuideController(services.sizeGuideService);
  const editorialLookController = new EditorialLookController(services.editorialLookService);

  // Product Routes
  fastify.get(
    "/products",
    {
      schema: {
        description: "Get paginated list of products with filtering options",
        tags: ["Products"],
        summary: "List Products",
        querystring: {
          type: "object",
          properties: {
            page: { type: "integer", minimum: 1, default: 1 },
            limit: { type: "integer", minimum: 1, maximum: 100, default: 20 },
            status: { type: "string", enum: ["draft", "published", "scheduled"] },
            categoryId: { type: "string", format: "uuid" },
            brand: { type: "string" },
            sortBy: { type: "string", enum: ["title", "createdAt", "updatedAt", "publishAt"], default: "createdAt" },
            sortOrder: { type: "string", enum: ["asc", "desc"], default: "desc" },
          },
        },
        response: {
          200: {
            description: "List of products with pagination",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  products: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        productId: { type: "string", format: "uuid" },
                        title: { type: "string" },
                        brand: { type: "string", nullable: true },
                        shortDesc: { type: "string", nullable: true },
                        status: { type: "string", enum: ["draft", "published", "scheduled"] },
                        publishAt: { type: "string", format: "date-time", nullable: true },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                      },
                    },
                  },
                  total: { type: "integer" },
                  page: { type: "integer" },
                  limit: { type: "integer" },
                },
              },
            },
          },
        },
      },
    },
    productController.listProducts.bind(productController)
  );

  fastify.get(
    "/products/:productId",
    {
      schema: {
        description: "Get product by ID with full details",
        tags: ["Products"],
        summary: "Get Product by ID",
        params: {
          type: "object",
          properties: {
            productId: { type: "string", format: "uuid" },
          },
          required: ["productId"],
        },
        response: {
          200: {
            description: "Product details",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  productId: { type: "string", format: "uuid" },
                  title: { type: "string" },
                  brand: { type: "string", nullable: true },
                  shortDesc: { type: "string", nullable: true },
                  longDescHtml: { type: "string", nullable: true },
                  status: { type: "string", enum: ["draft", "published", "scheduled"] },
                  publishAt: { type: "string", format: "date-time", nullable: true },
                  countryOfOrigin: { type: "string", nullable: true },
                  seoTitle: { type: "string", nullable: true },
                  seoDescription: { type: "string", nullable: true },
                  createdAt: { type: "string", format: "date-time" },
                  updatedAt: { type: "string", format: "date-time" },
                },
              },
            },
          },
          404: {
            description: "Product not found",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string", example: "Product not found" },
            },
          },
        },
      },
    },
    productController.getProduct.bind(productController)
  );

  fastify.post(
    "/products",
    {
      schema: {
        description: "Create a new product",
        tags: ["Products"],
        summary: "Create Product",
        body: {
          type: "object",
          required: ["title"],
          properties: {
            title: { type: "string", description: "Product title" },
            brand: { type: "string", description: "Product brand" },
            shortDesc: { type: "string", description: "Short description" },
            longDescHtml: { type: "string", description: "Long description in HTML" },
            status: { type: "string", enum: ["draft", "published", "scheduled"], default: "draft" },
            publishAt: { type: "string", format: "date-time", description: "Publish date for scheduled products" },
            countryOfOrigin: { type: "string", description: "Country of origin" },
            seoTitle: { type: "string", description: "SEO title" },
            seoDescription: { type: "string", description: "SEO description" },
            categoryIds: { type: "array", items: { type: "string", format: "uuid" }, description: "Category IDs" },
            tags: { type: "array", items: { type: "string" }, description: "Product tags" },
          },
        },
        response: {
          201: {
            description: "Product created successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  productId: { type: "string", format: "uuid" },
                  title: { type: "string" },
                  status: { type: "string" },
                  createdAt: { type: "string", format: "date-time" },
                },
              },
            },
          },
          400: {
            description: "Validation error",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string" },
              errors: { type: "array", items: { type: "string" } },
            },
          },
        },
      },
    },
    productController.createProduct.bind(productController)
  );

  fastify.put(
    "/products/:productId",
    {
      schema: {
        description: "Update an existing product",
        tags: ["Products"],
        summary: "Update Product",
        params: {
          type: "object",
          properties: {
            productId: { type: "string", format: "uuid" },
          },
          required: ["productId"],
        },
        body: {
          type: "object",
          properties: {
            title: { type: "string" },
            brand: { type: "string" },
            shortDesc: { type: "string" },
            longDescHtml: { type: "string" },
            status: { type: "string", enum: ["draft", "published", "scheduled"] },
            publishAt: { type: "string", format: "date-time" },
            countryOfOrigin: { type: "string" },
            seoTitle: { type: "string" },
            seoDescription: { type: "string" },
            categoryIds: { type: "array", items: { type: "string", format: "uuid" } },
            tags: { type: "array", items: { type: "string" } },
          },
        },
        response: {
          200: {
            description: "Product updated successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  productId: { type: "string", format: "uuid" },
                  updatedAt: { type: "string", format: "date-time" },
                },
              },
            },
          },
        },
      },
    },
    productController.updateProduct.bind(productController)
  );

  fastify.delete(
    "/products/:productId",
    {
      schema: {
        description: "Delete a product",
        tags: ["Products"],
        summary: "Delete Product",
        params: {
          type: "object",
          properties: {
            productId: { type: "string", format: "uuid" },
          },
          required: ["productId"],
        },
        response: {
          200: {
            description: "Product deleted successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: { type: "string", example: "Product deleted successfully" },
            },
          },
        },
      },
    },
    productController.deleteProduct.bind(productController)
  );

  // Product Search Routes
  fastify.get(
    "/search/products",
    {
      schema: {
        description: "Search products with filters",
        tags: ["Search"],
        summary: "Search Products",
        querystring: {
          type: "object",
          required: ["q"],
          properties: {
            q: { type: "string", minLength: 1, description: "Search query" },
            page: { type: "integer", minimum: 1, default: 1 },
            limit: { type: "integer", minimum: 1, maximum: 100, default: 20 },
            status: { type: "string", enum: ["draft", "published", "scheduled"] },
            categoryIds: { type: "array", items: { type: "string", format: "uuid" } },
            brands: { type: "array", items: { type: "string" } },
            minPrice: { type: "number", minimum: 0 },
            maxPrice: { type: "number", minimum: 0 },
          },
        },
        response: {
          200: {
            description: "Search results",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  products: { type: "array" },
                  total: { type: "integer" },
                  query: { type: "string" },
                  page: { type: "integer" },
                  limit: { type: "integer" },
                },
              },
            },
          },
        },
      },
    },
    searchController.searchProducts.bind(searchController)
  );

  // Category Routes
  fastify.get("/categories", categoryController.listCategories.bind(categoryController));
  fastify.get("/categories/:categoryId", categoryController.getCategory.bind(categoryController));
  fastify.post("/categories", categoryController.createCategory.bind(categoryController));
  fastify.put("/categories/:categoryId", categoryController.updateCategory.bind(categoryController));
  fastify.delete("/categories/:categoryId", categoryController.deleteCategory.bind(categoryController));

  // Variant Routes
  fastify.get("/products/:productId/variants", variantController.listVariants.bind(variantController));
  fastify.get("/variants/:variantId", variantController.getVariant.bind(variantController));
  fastify.post("/products/:productId/variants", variantController.createVariant.bind(variantController));
  fastify.put("/variants/:variantId", variantController.updateVariant.bind(variantController));
  fastify.delete("/variants/:variantId", variantController.deleteVariant.bind(variantController));

  // Media Routes
  fastify.get("/media", mediaController.listMedia.bind(mediaController));
  fastify.get("/media/:mediaId", mediaController.getMedia.bind(mediaController));
  fastify.post("/media/upload", mediaController.uploadMedia.bind(mediaController));
  fastify.delete("/media/:mediaId", mediaController.deleteMedia.bind(mediaController));

  // Product Media Routes
  fastify.get("/products/:productId/media", productMediaController.getProductMedia.bind(productMediaController));
  fastify.post("/products/:productId/media", productMediaController.addProductMedia.bind(productMediaController));
  fastify.put("/products/:productId/media/:mediaId", productMediaController.updateProductMedia.bind(productMediaController));
  fastify.delete("/products/:productId/media/:mediaId", productMediaController.removeProductMedia.bind(productMediaController));

  // Variant Media Routes
  fastify.get("/variants/:variantId/media", variantMediaController.getVariantMedia.bind(variantMediaController));
  fastify.post("/variants/:variantId/media", variantMediaController.addVariantMedia.bind(variantMediaController));
  fastify.put("/variants/:variantId/media/:mediaId", variantMediaController.updateVariantMedia.bind(variantMediaController));
  fastify.delete("/variants/:variantId/media/:mediaId", variantMediaController.removeVariantMedia.bind(variantMediaController));

  // Product Tag Routes
  fastify.get("/product-tags", productTagController.listTags.bind(productTagController));
  fastify.get("/product-tags/:tagId", productTagController.getTag.bind(productTagController));
  fastify.post("/product-tags", productTagController.createTag.bind(productTagController));
  fastify.put("/product-tags/:tagId", productTagController.updateTag.bind(productTagController));
  fastify.delete("/product-tags/:tagId", productTagController.deleteTag.bind(productTagController));

  // Size Guide Routes
  fastify.get("/size-guides", sizeGuideController.listSizeGuides.bind(sizeGuideController));
  fastify.get("/size-guides/:guideId", sizeGuideController.getSizeGuide.bind(sizeGuideController));
  fastify.post("/size-guides", sizeGuideController.createSizeGuide.bind(sizeGuideController));
  fastify.put("/size-guides/:guideId", sizeGuideController.updateSizeGuide.bind(sizeGuideController));
  fastify.delete("/size-guides/:guideId", sizeGuideController.deleteSizeGuide.bind(sizeGuideController));

  // Editorial Look Routes
  fastify.get("/editorial-looks", editorialLookController.listEditorialLooks.bind(editorialLookController));
  fastify.get("/editorial-looks/:lookId", editorialLookController.getEditorialLook.bind(editorialLookController));
  fastify.post("/editorial-looks", editorialLookController.createEditorialLook.bind(editorialLookController));
  fastify.put("/editorial-looks/:lookId", editorialLookController.updateEditorialLook.bind(editorialLookController));
  fastify.delete("/editorial-looks/:lookId", editorialLookController.deleteEditorialLook.bind(editorialLookController));
}