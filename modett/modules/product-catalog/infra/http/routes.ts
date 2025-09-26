import { FastifyInstance } from "fastify";
import {
  ProductController,
  CategoryController,
  VariantController,
  SearchController,
  MediaController,
} from "./controllers";
import {
  ProductManagementService,
  ProductSearchService,
  CategoryManagementService,
  VariantManagementService,
  MediaManagementService,
} from "../../application/services";
import {
  authenticateUser,
  authenticateAdmin,
  optionalAuth,
} from "../../../user-management/infra/http/middleware/auth.middleware";

// Standard authentication error responses for Swagger
const authErrorResponses = {
  401: {
    description: "Unauthorized - authentication required",
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      error: { type: "string", example: "Authentication required" },
      code: { type: "string", example: "AUTHENTICATION_ERROR" },
    },
  },
  403: {
    description: "Forbidden - insufficient permissions",
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      error: { type: "string", example: "Insufficient permissions" },
      code: { type: "string", example: "INSUFFICIENT_PERMISSIONS" },
    },
  },
};

// Route registration function
export async function registerProductCatalogRoutes(
  fastify: FastifyInstance,
  services: {
    productService: ProductManagementService;
    productSearchService: ProductSearchService;
    categoryService: CategoryManagementService;
    variantService: VariantManagementService;
    mediaService: MediaManagementService;
  }
) {
  // Initialize controllers
  const productController = new ProductController(
    services.productService,
    services.productSearchService
  );
  const categoryController = new CategoryController(services.categoryService);
  const variantController = new VariantController(services.variantService);
  const searchController = new SearchController(services.productSearchService);
  const mediaController = new MediaController(services.mediaService);

  // =============================================================================
  // PRODUCT ROUTES
  // =============================================================================

  // List products with filtering and pagination
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
            status: {
              type: "string",
              enum: ["draft", "published", "scheduled"],
            },
            categoryId: { type: "string", format: "uuid" },
            brand: { type: "string" },
            sortBy: {
              type: "string",
              enum: ["title", "createdAt", "updatedAt", "publishAt"],
              default: "createdAt",
            },
            sortOrder: {
              type: "string",
              enum: ["asc", "desc"],
              default: "desc",
            },
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
                        slug: { type: "string" },
                        brand: { type: "string", nullable: true },
                        shortDesc: { type: "string", nullable: true },
                        status: {
                          type: "string",
                          enum: ["draft", "published", "scheduled"],
                        },
                        publishAt: {
                          type: "string",
                          format: "date-time",
                          nullable: true,
                        },
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

  // Get product by ID
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
                  status: {
                    type: "string",
                    enum: ["draft", "published", "scheduled"],
                  },
                  publishAt: {
                    type: "string",
                    format: "date-time",
                    nullable: true,
                  },
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

  // Get product by slug
  fastify.get(
    "/products/slug/:slug",
    {
      schema: {
        description: "Get product by slug with full details",
        tags: ["Products"],
        summary: "Get Product by Slug",
        params: {
          type: "object",
          properties: {
            slug: { type: "string" },
          },
          required: ["slug"],
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
                  slug: { type: "string" },
                  brand: { type: "string", nullable: true },
                  shortDesc: { type: "string", nullable: true },
                  longDescHtml: { type: "string", nullable: true },
                  status: {
                    type: "string",
                    enum: ["draft", "published", "scheduled"],
                  },
                  publishAt: {
                    type: "string",
                    format: "date-time",
                    nullable: true,
                  },
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
    productController.getProductBySlug.bind(productController)
  );

  // Create new product
  fastify.post(
    "/products",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Create a new product",
        tags: ["Products"],
        summary: "Create Product",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["title"],
          properties: {
            title: { type: "string", description: "Product title" },
            brand: { type: "string", description: "Product brand" },
            shortDesc: { type: "string", description: "Short description" },
            longDescHtml: {
              type: "string",
              description: "Long description in HTML",
            },
            status: {
              type: "string",
              enum: ["draft", "published", "scheduled"],
              default: "draft",
            },
            publishAt: {
              type: "string",
              format: "date-time",
              description: "Publish date for scheduled products",
            },
            countryOfOrigin: {
              type: "string",
              description: "Country of origin",
            },
            seoTitle: { type: "string", description: "SEO title" },
            seoDescription: { type: "string", description: "SEO description" },
            categoryIds: {
              type: "array",
              items: { type: "string", format: "uuid" },
              description: "Category IDs",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "Product tags",
            },
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
                  slug: { type: "string" },
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
    productController.createProduct.bind(productController) as any
  );

  // Update existing product
  fastify.put(
    "/products/:productId",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Update an existing product",
        tags: ["Products"],
        summary: "Update Product",
        security: [{ bearerAuth: [] }],
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
            status: {
              type: "string",
              enum: ["draft", "published", "scheduled"],
            },
            publishAt: { type: "string", format: "date-time" },
            countryOfOrigin: { type: "string" },
            seoTitle: { type: "string" },
            seoDescription: { type: "string" },
            categoryIds: {
              type: "array",
              items: { type: "string", format: "uuid" },
            },
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
    productController.updateProduct.bind(productController) as any
  );

  // Delete product
  fastify.delete(
    "/products/:productId",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Delete a product",
        tags: ["Products"],
        summary: "Delete Product",
        security: [{ bearerAuth: [] }],
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
              message: {
                type: "string",
                example: "Product deleted successfully",
              },
            },
          },
        },
      },
    },
    productController.deleteProduct.bind(productController) as any
  );

  // =============================================================================
  // PRODUCT SEARCH ROUTES
  // =============================================================================

  // Advanced product search
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
            status: {
              type: "string",
              enum: ["draft", "published", "scheduled"],
            },
            categoryIds: {
              type: "array",
              items: { type: "string", format: "uuid" },
            },
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

  // =============================================================================
  // CATEGORY ROUTES
  // =============================================================================

  // List categories
  fastify.get(
    "/categories",
    {
      schema: {
        description: "Get paginated list of categories with filtering options",
        tags: ["Categories"],
        summary: "List Categories",
        querystring: {
          type: "object",
          properties: {
            page: { type: "integer", minimum: 1, default: 1 },
            limit: { type: "integer", minimum: 1, maximum: 100, default: 50 },
            parentId: { type: "string", format: "uuid" },
            includeChildren: { type: "boolean", default: false },
            sortBy: {
              type: "string",
              enum: ["name", "position", "createdAt"],
              default: "position",
            },
            sortOrder: {
              type: "string",
              enum: ["asc", "desc"],
              default: "asc",
            },
          },
        },
        response: {
          200: {
            description: "List of categories",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    slug: { type: "string" },
                    parentId: { type: "string", nullable: true },
                    position: { type: "number", nullable: true },
                  },
                  required: ["id", "name", "slug"],
                },
              },
              meta: {
                type: "object",
                properties: {
                  page: { type: "number" },
                  limit: { type: "number" },
                  parentId: { type: "string", nullable: true },
                  includeChildren: { type: "boolean" },
                  sortBy: { type: "string" },
                  sortOrder: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    categoryController.getCategories.bind(categoryController)
  );

  // Get category by ID
  fastify.get(
    "/categories/:id",
    {
      schema: {
        description: "Get category by ID",
        tags: ["Categories"],
        summary: "Get Category",
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
          },
          required: ["id"],
        },
      },
    },
    categoryController.getCategory.bind(categoryController)
  );

  // Get category by slug
  fastify.get(
    "/categories/slug/:slug",
    {
      schema: {
        description: "Get category by slug",
        tags: ["Categories"],
        summary: "Get Category by Slug",
        params: {
          type: "object",
          properties: {
            slug: { type: "string" },
          },
          required: ["slug"],
        },
      },
    },
    categoryController.getCategoryBySlug.bind(categoryController)
  );

  // Get category hierarchy
  fastify.get(
    "/categories/hierarchy",
    {
      schema: {
        description: "Get category hierarchy tree",
        tags: ["Categories"],
        summary: "Get Category Hierarchy",
      },
    },
    categoryController.getCategoryHierarchy.bind(categoryController)
  );

  // Create new category
  fastify.post(
    "/categories",
    {
      // preHandler: authenticateAdmin, // Temporarily disabled for testing
      schema: {
        description: "Create a new category",
        tags: ["Categories"],
        summary: "Create Category",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", description: "Category name" },
            parentId: {
              type: "string",
              format: "uuid",
              description: "Parent category ID",
            },
            position: {
              type: "integer",
              minimum: 0,
              description: "Display position",
            },
          },
        },
        response: {
          201: {
            description: "Category created successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  name: { type: "string" },
                },
              },
              message: {
                type: "string",
                example: "Category created successfully",
              },
            },
          },
        },
      },
    },
    categoryController.createCategory.bind(categoryController) as any
  );

  // Update category
  fastify.put(
    "/categories/:id",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Update an existing category",
        tags: ["Categories"],
        summary: "Update Category",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
          },
          required: ["id"],
        },
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            parentId: { type: "string", format: "uuid" },
            position: { type: "integer", minimum: 0 },
          },
        },
      },
    },
    categoryController.updateCategory.bind(categoryController) as any
  );

  // Delete category
  fastify.delete(
    "/categories/:id",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Delete a category",
        tags: ["Categories"],
        summary: "Delete Category",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
          },
          required: ["id"],
        },
      },
    },
    categoryController.deleteCategory.bind(categoryController) as any
  );

  // Reorder categories
  fastify.post(
    "/categories/reorder",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Reorder categories by updating positions",
        tags: ["Categories"],
        summary: "Reorder Categories",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          properties: {
            categoryOrders: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  position: { type: "integer", minimum: 0 },
                },
                required: ["id", "position"],
              },
            },
          },
          required: ["categoryOrders"],
        },
      },
    },
    categoryController.reorderCategories.bind(categoryController) as any
  );

  // =============================================================================
  // PRODUCT VARIANT ROUTES
  // =============================================================================

  // List variants for a product
  fastify.get(
    "/products/:productId/variants",
    {
      schema: {
        description: "Get variants for a product",
        tags: ["Variants"],
        summary: "List Product Variants",
        params: {
          type: "object",
          properties: {
            productId: { type: "string", format: "uuid" },
          },
          required: ["productId"],
        },
        querystring: {
          type: "object",
          properties: {
            page: { type: "integer", minimum: 1, default: 1 },
            limit: { type: "integer", minimum: 1, maximum: 100, default: 20 },
            size: { type: "string" },
            color: { type: "string" },
            minPrice: { type: "number", minimum: 0 },
            maxPrice: { type: "number", minimum: 0 },
            inStock: { type: "boolean" },
            sortBy: {
              type: "string",
              enum: ["price", "sku", "createdAt", "size", "color"],
              default: "price",
            },
            sortOrder: {
              type: "string",
              enum: ["asc", "desc"],
              default: "asc",
            },
          },
        },
      },
    },
    variantController.getVariants.bind(variantController)
  );

  // Get variant by ID
  fastify.get(
    "/variants/:id",
    {
      schema: {
        description: "Get variant by ID",
        tags: ["Variants"],
        summary: "Get Variant",
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
          },
          required: ["id"],
        },
      },
    },
    variantController.getVariant.bind(variantController)
  );

  // Create new variant for a product
  fastify.post(
    "/products/:productId/variants",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Create a new variant for a product",
        tags: ["Variants"],
        summary: "Create Variant",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            productId: { type: "string", format: "uuid" },
          },
          required: ["productId"],
        },
        body: {
          type: "object",
          required: ["sku", "price"],
          properties: {
            sku: { type: "string", description: "Stock Keeping Unit" },
            size: { type: "string", description: "Product size" },
            color: { type: "string", description: "Product color" },
            barcode: { type: "string", description: "Barcode" },
            price: { type: "number", minimum: 0, description: "Price" },
            compareAtPrice: {
              type: "number",
              minimum: 0,
              description: "Compare at price",
            },
            weightG: {
              type: "integer",
              minimum: 0,
              description: "Weight in grams",
            },
            dims: { type: "object", description: "Dimensions object" },
            taxClass: { type: "string", description: "Tax classification" },
            allowBackorder: { type: "boolean", description: "Allow backorder" },
            allowPreorder: { type: "boolean", description: "Allow preorder" },
            restockEta: {
              type: "string",
              format: "date-time",
              description: "Restock ETA",
            },
          },
        },
      },
    },
    variantController.createVariant.bind(variantController) as any
  );

  // Update variant
  fastify.put(
    "/variants/:id",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Update an existing variant",
        tags: ["Variants"],
        summary: "Update Variant",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
          },
          required: ["id"],
        },
        body: {
          type: "object",
          properties: {
            sku: { type: "string" },
            size: { type: "string" },
            color: { type: "string" },
            barcode: { type: "string" },
            price: { type: "number", minimum: 0 },
            compareAtPrice: { type: "number", minimum: 0 },
            weightG: { type: "integer", minimum: 0 },
            dims: { type: "object" },
            taxClass: { type: "string" },
            allowBackorder: { type: "boolean" },
            allowPreorder: { type: "boolean" },
            restockEta: { type: "string", format: "date-time" },
          },
        },
      },
    },
    variantController.updateVariant.bind(variantController) as any
  );

  // Delete variant
  fastify.delete(
    "/variants/:id",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Delete a variant",
        tags: ["Variants"],
        summary: "Delete Variant",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
          },
          required: ["id"],
        },
      },
    },
    variantController.deleteVariant.bind(variantController) as any
  );

  // =============================================================================
  // MEDIA ASSET ROUTES
  // =============================================================================

  // List media assets
  fastify.get(
    "/media",
    {
      schema: {
        description:
          "Get paginated list of media assets with filtering options",
        tags: ["Media"],
        summary: "List Media Assets",
        querystring: {
          type: "object",
          properties: {
            page: { type: "integer", minimum: 1, default: 1 },
            limit: { type: "integer", minimum: 1, maximum: 100, default: 20 },
            mimeType: { type: "string" },
            isImage: { type: "boolean" },
            isVideo: { type: "boolean" },
            hasRenditions: { type: "boolean" },
            minBytes: { type: "integer", minimum: 0 },
            maxBytes: { type: "integer", minimum: 0 },
            minWidth: { type: "integer", minimum: 1 },
            maxWidth: { type: "integer", minimum: 1 },
            minHeight: { type: "integer", minimum: 1 },
            maxHeight: { type: "integer", minimum: 1 },
            sortBy: {
              type: "string",
              enum: ["createdAt", "bytes", "width", "height", "version"],
              default: "createdAt",
            },
            sortOrder: {
              type: "string",
              enum: ["asc", "desc"],
              default: "desc",
            },
          },
        },
      },
    },
    mediaController.getMediaAssets.bind(mediaController)
  );

  // Get media asset by ID
  fastify.get(
    "/media/:id",
    {
      schema: {
        description: "Get media asset by ID",
        tags: ["Media"],
        summary: "Get Media Asset",
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
          },
          required: ["id"],
        },
      },
    },
    mediaController.getMediaAsset.bind(mediaController)
  );

  // Create new media asset
  fastify.post(
    "/media",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Create a new media asset",
        tags: ["Media"],
        summary: "Create Media Asset",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["storageKey", "mime"],
          properties: {
            storageKey: {
              type: "string",
              description: "Storage key for the asset",
            },
            mime: { type: "string", description: "MIME type" },
            width: { type: "integer", minimum: 1, description: "Image width" },
            height: {
              type: "integer",
              minimum: 1,
              description: "Image height",
            },
            bytes: {
              type: "integer",
              minimum: 0,
              description: "File size in bytes",
            },
            altText: {
              type: "string",
              description: "Alt text for accessibility",
            },
            focalX: {
              type: "integer",
              description: "Focal point X coordinate",
            },
            focalY: {
              type: "integer",
              description: "Focal point Y coordinate",
            },
            renditions: { type: "object", description: "Renditions data" },
          },
        },
      },
    },
    mediaController.createMediaAsset.bind(mediaController) as any
  );

  // Update media asset
  fastify.put(
    "/media/:id",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Update an existing media asset",
        tags: ["Media"],
        summary: "Update Media Asset",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
          },
          required: ["id"],
        },
        body: {
          type: "object",
          properties: {
            mime: { type: "string" },
            width: { type: "integer", minimum: 1 },
            height: { type: "integer", minimum: 1 },
            bytes: { type: "integer", minimum: 0 },
            altText: { type: "string" },
            focalX: { type: "integer" },
            focalY: { type: "integer" },
            renditions: { type: "object" },
          },
        },
      },
    },
    mediaController.updateMediaAsset.bind(mediaController) as any
  );

  // Delete media asset
  fastify.delete(
    "/media/:id",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Delete a media asset",
        tags: ["Media"],
        summary: "Delete Media Asset",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
          },
          required: ["id"],
        },
      },
    },
    mediaController.deleteMediaAsset.bind(mediaController) as any
  );
}
