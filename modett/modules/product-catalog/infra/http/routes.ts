import { FastifyInstance } from "fastify";
import {
  ProductController,
  CategoryController,
  VariantController,
  SearchController,
  MediaController,
  ProductTagController,
  SizeGuideController,
  EditorialLookController,
  ProductMediaController,
} from "./controllers";
import {
  ProductManagementService,
  ProductSearchService,
  CategoryManagementService,
  VariantManagementService,
  MediaManagementService,
  ProductTagManagementService,
  SizeGuideManagementService,
  EditorialLookManagementService,
  ProductMediaManagementService,
} from "../../application/services";
import {
  authenticateUser,
  authenticateAdmin,
  optionalAuth,
} from "../../../user-management/infra/http/middleware/auth.middleware";
import { PrismaClient } from "@prisma/client";

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
    productTagService: ProductTagManagementService;
    sizeGuideService: SizeGuideManagementService;
    editorialLookService: EditorialLookManagementService;
    productMediaService: ProductMediaManagementService;
    prisma: PrismaClient;
  }
) {
  // Initialize controllers
  const productController = new ProductController(
    services.productService,
    services.productSearchService,
    services.prisma
  );
  const categoryController = new CategoryController(services.categoryService);
  const variantController = new VariantController(services.variantService);
  const searchController = new SearchController(services.productSearchService);
  const mediaController = new MediaController(services.mediaService);
  const productTagController = new ProductTagController(
    services.productTagService
  );
  const sizeGuideController = new SizeGuideController(
    services.sizeGuideService
  );
  const editorialLookController = new EditorialLookController(
    services.editorialLookService
  );
  const productMediaController = new ProductMediaController(
    services.productMediaService
  );

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
            // search: { type: "string" },
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
                        longDescHtml: { type: "string", nullable: true },
                        countryOfOrigin: { type: "string", nullable: true },
                        seoTitle: { type: "string", nullable: true },
                        seoDescription: { type: "string", nullable: true },
                        publishAt: {
                          type: "string",
                          format: "date-time",
                          nullable: true,
                        },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                        variants: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              id: { type: "string" },
                              sku: { type: "string" },
                              size: { type: "string", nullable: true },
                              color: { type: "string", nullable: true },
                              price: { type: "string" },
                              compareAtPrice: { type: "string", nullable: true },
                              inventory: { type: "integer" },
                            },
                          },
                        },
                        images: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              url: { type: "string" },
                              alt: { type: "string", nullable: true },
                              width: { type: "integer", nullable: true },
                              height: { type: "integer", nullable: true },
                            },
                          },
                        },
                        categories: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              id: { type: "string" },
                              name: { type: "string" },
                              slug: { type: "string" },
                              position: { type: "integer", nullable: true },
                            },
                          },
                        },
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
                  images: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        url: { type: "string" },
                        alt: { type: "string" },
                        width: { type: "number" },
                        height: { type: "number" },
                      },
                    },
                  },
                  variants: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        sku: { type: "string" },
                        size: { type: "string", nullable: true },
                        color: { type: "string", nullable: true },
                        price: { type: "string" },
                        compareAtPrice: { type: "string", nullable: true },
                        inventory: { type: "number" },
                      },
                    },
                  },
                  categories: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        slug: { type: "string" },
                        position: { type: "number" },
                      },
                    },
                  },
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
  // fastify.get(
  //   "/search/products",
  //   {
  //     schema: {
  //       description: "Search products with filters",
  //       tags: ["Search"],
  //       summary: "Search Products",
  //       querystring: {
  //         type: "object",
  //         required: ["q"],
  //         properties: {
  //           q: { type: "string", minLength: 1, description: "Search query" },
  //           page: { type: "integer", minimum: 1, default: 1 },
  //           limit: { type: "integer", minimum: 1, maximum: 100, default: 20 },
  //           status: {
  //             type: "string",
  //             enum: ["draft", "published", "scheduled"],
  //           },
  //           categoryIds: {
  //             type: "array",
  //             items: { type: "string", format: "uuid" },
  //           },
  //           brands: { type: "array", items: { type: "string" } },
  //           minPrice: { type: "number", minimum: 0 },
  //           maxPrice: { type: "number", minimum: 0 },
  //         },
  //       },
  //       response: {
  //         200: {
  //           description: "Search results",
  //           type: "object",
  //           properties: {
  //             success: { type: "boolean", example: true },
  //             data: {
  //               type: "object",
  //               properties: {
  //                 products: { type: "array" },
  //                 total: { type: "integer" },
  //                 query: { type: "string" },
  //                 page: { type: "integer" },
  //                 limit: { type: "integer" },
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   },
  //   searchController.searchProducts.bind(searchController)
  // );

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
      preHandler: authenticateUser,
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

  // =============================================================================
  // PRODUCT MEDIA ASSOCIATION ROUTES
  // =============================================================================

  // Get all media for a product
  fastify.get(
    "/products/:productId/media",
    {
      schema: {
        description: "Get all media assets associated with a product",
        tags: ["Product Media"],
        summary: "Get Product Media",
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
            includeAssetDetails: {
              type: "boolean",
              default: true,
              description: "Include full asset details",
            },
            sortBy: {
              type: "string",
              enum: ["position", "createdAt"],
              default: "position",
            },
          },
        },
        response: {
          200: {
            description: "Product media retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  productId: { type: "string" },
                  totalMedia: { type: "number" },
                  hasCoverImage: { type: "boolean" },
                  coverImageAssetId: { type: "string" },
                  mediaAssets: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        assetId: { type: "string" },
                        position: { type: "number" },
                        isCover: { type: "boolean" },
                        storageKey: { type: "string" },
                        mimeType: { type: "string" },
                        altText: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: "Product not found",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string" },
            },
          },
        },
      },
    },
    productMediaController.getProductMedia.bind(productMediaController)
  );

  // Add media to a product
  fastify.post(
    "/products/:productId/media",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Add/attach a media asset to a product",
        tags: ["Product Media"],
        summary: "Add Media to Product",
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
          required: ["assetId"],
          properties: {
            assetId: {
              type: "string",
              format: "uuid",
              description: "Media asset ID to attach",
            },
            position: {
              type: "integer",
              minimum: 1,
              description: "Display position",
            },
            isCover: {
              type: "boolean",
              description: "Set as cover/primary image",
            },
          },
        },
        response: {
          201: {
            description: "Media added to product successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  productMediaId: { type: "string" },
                },
              },
              message: { type: "string" },
            },
          },
          404: {
            description: "Product or media asset not found",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string" },
            },
          },
          409: {
            description: "Media already associated with product",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string" },
            },
          },
          ...authErrorResponses,
        },
      },
    },
    productMediaController.addMediaToProduct.bind(productMediaController) as any
  );

  // Remove media from a product
  fastify.delete(
    "/products/:productId/media/:assetId",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Remove a media asset from a product",
        tags: ["Product Media"],
        summary: "Remove Product Media",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            productId: { type: "string", format: "uuid" },
            assetId: { type: "string", format: "uuid" },
          },
          required: ["productId", "assetId"],
        },
        response: {
          200: {
            description: "Media removed successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: { type: "string" },
            },
          },
          404: {
            description: "Association not found",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string" },
            },
          },
          ...authErrorResponses,
        },
      },
    },
    productMediaController.removeMediaFromProduct.bind(
      productMediaController
    ) as any
  );

  // Set product cover image
  fastify.post(
    "/products/:productId/media/cover",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Set a media asset as the product cover/primary image",
        tags: ["Product Media"],
        summary: "Set Product Cover Image",
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
          required: ["assetId"],
          properties: {
            assetId: {
              type: "string",
              format: "uuid",
              description: "Media asset ID to set as cover",
            },
          },
        },
        response: {
          200: {
            description: "Cover image set successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: { type: "string" },
            },
          },
          404: {
            description: "Product or media not found or not associated",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string" },
            },
          },
          ...authErrorResponses,
        },
      },
    },
    productMediaController.setProductCoverImage.bind(
      productMediaController
    ) as any
  );

  // Reorder product media
  fastify.post(
    "/products/:productId/media/reorder",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Reorder media assets for a product",
        tags: ["Product Media"],
        summary: "Reorder Product Media",
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
          required: ["reorderData"],
          properties: {
            reorderData: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  assetId: { type: "string", format: "uuid" },
                  position: { type: "integer", minimum: 1 },
                },
                required: ["assetId", "position"],
              },
              minItems: 1,
            },
          },
        },
        response: {
          200: {
            description: "Media reordered successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: { type: "string" },
            },
          },
          400: {
            description: "Invalid reorder data",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string" },
            },
          },
          404: {
            description: "Product or media not found",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string" },
            },
          },
          ...authErrorResponses,
        },
      },
    },
    productMediaController.reorderProductMedia.bind(
      productMediaController
    ) as any
  );

  // =============================================================================
  // PRODUCT TAG ROUTES
  // =============================================================================

  // List tags with filtering and pagination
  fastify.get(
    "/tags",
    {
      schema: {
        description:
          "Get paginated list of product tags with filtering options",
        tags: ["Product Tags"],
        summary: "List Product Tags",
        querystring: {
          type: "object",
          properties: {
            page: { type: "integer", minimum: 1, default: 1 },
            limit: { type: "integer", minimum: 1, maximum: 100, default: 20 },
            kind: { type: "string" },
            sortBy: {
              type: "string",
              enum: ["tag", "kind"],
              default: "tag",
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
            description: "List of tags retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  tags: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string", format: "uuid" },
                        tag: { type: "string" },
                        kind: { type: "string" },
                        usage_count: { type: "integer" },
                        created_at: { type: "string", format: "date-time" },
                        updated_at: { type: "string", format: "date-time" },
                      },
                    },
                  },
                  pagination: {
                    type: "object",
                    properties: {
                      page: { type: "integer" },
                      limit: { type: "integer" },
                      total: { type: "integer" },
                      total_pages: { type: "integer" },
                    },
                  },
                },
              },
            },
          },
          ...authErrorResponses,
        },
      },
    },
    productTagController.getTags.bind(productTagController) as any
  );

  // Get tag statistics (MUST be before /tags/:id to avoid matching "statistics" as an ID)
  fastify.get(
    "/tags/statistics",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Get statistics about product tags",
        tags: ["Product Tags"],
        summary: "Get Tag Statistics",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            description: "Tag statistics retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  totalTags: { type: "integer" },
                  tagsByKind: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        kind: { type: "string", nullable: true },
                        count: { type: "integer" },
                      },
                    },
                  },
                  averageTagLength: { type: "number" },
                },
              },
            },
          },
          ...authErrorResponses,
        },
      },
    },
    productTagController.getTagStats.bind(productTagController) as any
  );

  // Get single tag by ID
  fastify.get(
    "/tags/:id",
    {
      schema: {
        description: "Get a specific product tag by ID",
        tags: ["Product Tags"],
        summary: "Get Product Tag",
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
          },
          required: ["id"],
        },
        response: {
          200: {
            description: "Tag retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  tag: { type: "string" },
                  kind: { type: "string" },
                  usage_count: { type: "integer" },
                  created_at: { type: "string", format: "date-time" },
                  updated_at: { type: "string", format: "date-time" },
                },
              },
            },
          },
          404: {
            description: "Tag not found",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string", example: "Tag not found" },
              code: { type: "string", example: "TAG_NOT_FOUND" },
            },
          },
          ...authErrorResponses,
        },
      },
    },
    productTagController.getTag.bind(productTagController) as any
  );

  // Get tag by name
  fastify.get(
    "/tags/name/:name",
    {
      schema: {
        description: "Get a specific product tag by name",
        tags: ["Product Tags"],
        summary: "Get Product Tag by Name",
        params: {
          type: "object",
          properties: {
            name: { type: "string" },
          },
          required: ["name"],
        },
        response: {
          200: {
            description: "Tag retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  tag: { type: "string" },
                  kind: { type: "string" },
                  usage_count: { type: "integer" },
                  created_at: { type: "string", format: "date-time" },
                  updated_at: { type: "string", format: "date-time" },
                },
              },
            },
          },
          404: {
            description: "Tag not found",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string", example: "Tag not found" },
              code: { type: "string", example: "TAG_NOT_FOUND" },
            },
          },
          ...authErrorResponses,
        },
      },
    },
    productTagController.getTagByName.bind(productTagController) as any
  );

  // Create new tag
  fastify.post(
    "/tags",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Create a new product tag",
        tags: ["Product Tags"],
        summary: "Create Product Tag",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          properties: {
            tag: { type: "string", minLength: 1 },
            kind: { type: "string" },
          },
          required: ["tag"],
        },
        response: {
          201: {
            description: "Tag created successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  tag: { type: "string" },
                  kind: { type: "string" },
                  usage_count: { type: "integer", example: 0 },
                  created_at: { type: "string", format: "date-time" },
                  updated_at: { type: "string", format: "date-time" },
                },
              },
            },
          },
          400: {
            description: "Validation error",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string", example: "Validation failed" },
              code: { type: "string", example: "VALIDATION_ERROR" },
            },
          },
          409: {
            description: "Tag already exists",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string", example: "Tag already exists" },
              code: { type: "string", example: "TAG_ALREADY_EXISTS" },
            },
          },
          ...authErrorResponses,
        },
      },
    },
    productTagController.createTag.bind(productTagController) as any
  );

  // Update tag
  fastify.put(
    "/tags/:id",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Update an existing product tag",
        tags: ["Product Tags"],
        summary: "Update Product Tag",
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
            tag: { type: "string", minLength: 1 },
            kind: { type: "string" },
          },
        },
        response: {
          200: {
            description: "Tag updated successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  tag: { type: "string" },
                  kind: { type: "string" },
                  usage_count: { type: "integer" },
                  created_at: { type: "string", format: "date-time" },
                  updated_at: { type: "string", format: "date-time" },
                },
              },
            },
          },
          404: {
            description: "Tag not found",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string", example: "Tag not found" },
              code: { type: "string", example: "TAG_NOT_FOUND" },
            },
          },
          ...authErrorResponses,
        },
      },
    },
    productTagController.updateTag.bind(productTagController) as any
  );

  // Delete tag
  fastify.delete(
    "/tags/:id",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Delete a product tag",
        tags: ["Product Tags"],
        summary: "Delete Product Tag",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
          },
          required: ["id"],
        },
        response: {
          200: {
            description: "Tag deleted successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: { type: "string", example: "Tag deleted successfully" },
            },
          },
          404: {
            description: "Tag not found",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string", example: "Tag not found" },
              code: { type: "string", example: "TAG_NOT_FOUND" },
            },
          },
          ...authErrorResponses,
        },
      },
    },
    productTagController.deleteTag.bind(productTagController) as any
  );

  // Bulk create tags
  fastify.post(
    "/tags/bulk",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Create multiple product tags in bulk",
        tags: ["Product Tags"],
        summary: "Bulk Create Product Tags",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          properties: {
            tags: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  tag: { type: "string", minLength: 1 },
                  kind: { type: "string" },
                },
                required: ["tag"],
              },
              minItems: 1,
              maxItems: 100,
            },
          },
          required: ["tags"],
        },
        response: {
          201: {
            description: "Tags created successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string", format: "uuid" },
                    tag: { type: "string" },
                    kind: { type: "string", nullable: true },
                  },
                },
              },
              message: { type: "string" },
            },
          },
          400: {
            description: "Validation error",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string", example: "Validation failed" },
              code: { type: "string", example: "VALIDATION_ERROR" },
            },
          },
          ...authErrorResponses,
        },
      },
    },
    productTagController.createBulkTags.bind(productTagController) as any
  );

  // Bulk delete tags
  fastify.delete(
    "/tags/bulk",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Delete multiple product tags in bulk",
        tags: ["Product Tags"],
        summary: "Bulk Delete Product Tags",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          properties: {
            ids: {
              type: "array",
              items: { type: "string", format: "uuid" },
              minItems: 1,
              maxItems: 100,
            },
          },
          required: ["ids"],
        },
        response: {
          200: {
            description: "Tags deleted successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  deleted: {
                    type: "array",
                    items: { type: "string" },
                  },
                  failed: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        error: { type: "string" },
                      },
                    },
                  },
                },
              },
              message: { type: "string" },
            },
          },
          400: {
            description: "Validation error",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string", example: "Validation failed" },
              code: { type: "string", example: "VALIDATION_ERROR" },
            },
          },
          ...authErrorResponses,
        },
      },
    },
    productTagController.deleteBulkTags.bind(productTagController) as any
  );

  // =============================================================================
  // PRODUCT TAG ASSOCIATIONS
  // =============================================================================

  // Get tags for a specific product
  fastify.get(
    "/products/:productId/tags",
    {
      schema: {
        description: "Get all tags associated with a product",
        tags: ["Product Tag Associations"],
        summary: "Get Product Tags",
        params: {
          type: "object",
          properties: {
            productId: { type: "string", format: "uuid" },
          },
          required: ["productId"],
        },
        response: {
          200: {
            description: "Product tags retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string", format: "uuid" },
                    tag: { type: "string" },
                    kind: { type: "string", nullable: true },
                  },
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
    productTagController.getProductTags.bind(productTagController) as any
  );

  // Associate tags with a product
  fastify.post(
    "/products/:productId/tags",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Associate tags with a product",
        tags: ["Product Tag Associations"],
        summary: "Associate Product Tags",
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
            tagIds: {
              type: "array",
              items: { type: "string", format: "uuid" },
              minItems: 1,
            },
          },
          required: ["tagIds"],
        },
        response: {
          200: {
            description: "Tags associated successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: {
                type: "string",
                example: "Tags associated successfully",
              },
            },
          },
          404: {
            description: "Product or tag not found",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string" },
            },
          },
          ...authErrorResponses,
        },
      },
    },
    productTagController.associateProductTags.bind(productTagController) as any
  );

  // Remove a specific tag from a product
  fastify.delete(
    "/products/:productId/tags/:tagId",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Remove a tag from a product",
        tags: ["Product Tag Associations"],
        summary: "Remove Product Tag",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            productId: { type: "string", format: "uuid" },
            tagId: { type: "string", format: "uuid" },
          },
          required: ["productId", "tagId"],
        },
        response: {
          200: {
            description: "Tag removed successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: { type: "string", example: "Tag removed successfully" },
            },
          },
          404: {
            description: "Product or tag association not found",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string" },
            },
          },
          ...authErrorResponses,
        },
      },
    },
    productTagController.removeProductTag.bind(productTagController) as any
  );

  // Get products for a specific tag
  fastify.get(
    "/tags/:tagId/products",
    {
      schema: {
        description: "Get all products associated with a tag",
        tags: ["Product Tag Associations"],
        summary: "Get Tag Products",
        params: {
          type: "object",
          properties: {
            tagId: { type: "string", format: "uuid" },
          },
          required: ["tagId"],
        },
        querystring: {
          type: "object",
          properties: {
            page: { type: "integer", minimum: 1, default: 1 },
            limit: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          },
        },
        response: {
          200: {
            description: "Tag products retrieved successfully",
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
                        id: { type: "string", format: "uuid" },
                        title: { type: "string" },
                        slug: { type: "string" },
                        brand: { type: "string", nullable: true },
                        status: { type: "string" },
                      },
                    },
                  },
                  pagination: {
                    type: "object",
                    properties: {
                      page: { type: "integer" },
                      limit: { type: "integer" },
                      total: { type: "integer" },
                      total_pages: { type: "integer" },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: "Tag not found",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string", example: "Tag not found" },
            },
          },
        },
      },
    },
    productTagController.getTagProducts.bind(productTagController) as any
  );

  // =============================================================================
  // SIZE GUIDE ROUTES
  // =============================================================================

  // List size guides with filtering and pagination
  fastify.get(
    "/size-guides",
    {
      schema: {
        description: "Get paginated list of size guides with filtering options",
        tags: ["Size Guides"],
        summary: "List Size Guides",
        querystring: {
          type: "object",
          properties: {
            page: { type: "integer", minimum: 1, default: 1 },
            limit: { type: "integer", minimum: 1, maximum: 100, default: 20 },
            region: { type: "string", enum: ["US", "UK", "EU", "ASIA"] },
            category: { type: "string" },
            hasContent: { type: "boolean" },
            sortBy: {
              type: "string",
              enum: ["title", "region", "category"],
              default: "title",
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
            description: "List of size guides retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  sizeGuides: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string", format: "uuid" },
                        title: { type: "string" },
                        bodyHtml: { type: "string", nullable: true },
                        region: {
                          type: "string",
                          enum: ["US", "UK", "EU", "ASIA"],
                        },
                        category: { type: "string", nullable: true },
                      },
                    },
                  },
                  pagination: {
                    type: "object",
                    properties: {
                      page: { type: "integer" },
                      limit: { type: "integer" },
                      total: { type: "integer" },
                      total_pages: { type: "integer" },
                    },
                  },
                },
              },
            },
          },
          ...authErrorResponses,
        },
      },
    },
    sizeGuideController.getSizeGuides.bind(sizeGuideController) as any
  );

  // Get size guide statistics (MUST be before /:id route)
  fastify.get(
    "/size-guides/statistics",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Get statistics about size guides",
        tags: ["Size Guides"],
        summary: "Get Size Guide Statistics",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            description: "Size guide statistics retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  totalGuides: { type: "integer" },
                  guidesByRegion: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        region: { type: "string" },
                        count: { type: "integer" },
                      },
                    },
                  },
                  guidesByCategory: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category: { type: "string", nullable: true },
                        count: { type: "integer" },
                      },
                    },
                  },
                  guidesWithContent: { type: "integer" },
                  guidesWithoutContent: { type: "integer" },
                },
              },
            },
          },
          ...authErrorResponses,
        },
      },
    },
    sizeGuideController.getSizeGuideStats.bind(sizeGuideController) as any
  );

  // Get regional size guides (MUST be before /:id route)
  fastify.get(
    "/size-guides/regions/:region",
    {
      schema: {
        description: "Get size guides for a specific region",
        tags: ["Size Guides"],
        summary: "Get Regional Size Guides",
        params: {
          type: "object",
          properties: {
            region: { type: "string", enum: ["US", "UK", "EU"] },
          },
          required: ["region"],
        },
        querystring: {
          type: "object",
          properties: {
            page: { type: "integer", minimum: 1, default: 1 },
            limit: { type: "integer", minimum: 1, maximum: 100, default: 20 },
            category: { type: "string" },
            hasContent: { type: "boolean" },
            sortBy: {
              type: "string",
              enum: ["title", "category"],
              default: "title",
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
            description: "Regional size guides retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  sizeGuides: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string", format: "uuid" },
                        title: { type: "string" },
                        bodyHtml: { type: "string" },
                        region: {
                          type: "string",
                          enum: ["US", "UK", "EU", "ASIA"],
                        },
                        category: { type: "string" },
                        created_at: { type: "string", format: "date-time" },
                        updated_at: { type: "string", format: "date-time" },
                      },
                    },
                  },
                  pagination: {
                    type: "object",
                    properties: {
                      page: { type: "integer" },
                      limit: { type: "integer" },
                      total: { type: "integer" },
                      total_pages: { type: "integer" },
                    },
                  },
                },
              },
            },
          },
          ...authErrorResponses,
        },
      },
    },
    sizeGuideController.getRegionalSizeGuides.bind(sizeGuideController) as any
  );

  // Bulk create size guides (MUST be before /:id route)
  fastify.post(
    "/size-guides/bulk",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Create multiple size guides in bulk",
        tags: ["Size Guides"],
        summary: "Bulk Create Size Guides",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          properties: {
            guides: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string", minLength: 1 },
                  bodyHtml: { type: "string" },
                  region: { type: "string", enum: ["US", "UK", "EU"] },
                  category: { type: "string" },
                },
                required: ["title", "region"],
              },
              minItems: 1,
              maxItems: 50,
            },
          },
          required: ["guides"],
        },
        response: {
          201: {
            description: "Size guides created successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  created: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string", format: "uuid" },
                        title: { type: "string" },
                        bodyHtml: { type: "string" },
                        region: {
                          type: "string",
                          enum: ["US", "UK", "EU", "ASIA"],
                        },
                        category: { type: "string" },
                        created_at: { type: "string", format: "date-time" },
                        updated_at: { type: "string", format: "date-time" },
                      },
                    },
                  },
                  skipped: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        reason: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Validation error",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string", example: "Validation failed" },
              code: { type: "string", example: "VALIDATION_ERROR" },
            },
          },
          ...authErrorResponses,
        },
      },
    },
    sizeGuideController.createBulkSizeGuides.bind(sizeGuideController) as any
  );

  // Get single size guide by ID
  fastify.get(
    "/size-guides/:id",
    {
      schema: {
        description: "Get a specific size guide by ID",
        tags: ["Size Guides"],
        summary: "Get Size Guide",
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
          },
          required: ["id"],
        },
        response: {
          200: {
            description: "Size guide retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  title: { type: "string" },
                  bodyHtml: { type: "string" },
                  region: { type: "string", enum: ["US", "UK", "EU", "ASIA"] },
                  category: { type: "string" },
                  created_at: { type: "string", format: "date-time" },
                  updated_at: { type: "string", format: "date-time" },
                },
              },
            },
          },
          404: {
            description: "Size guide not found",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string", example: "Size guide not found" },
              code: { type: "string", example: "SIZE_GUIDE_NOT_FOUND" },
            },
          },
          ...authErrorResponses,
        },
      },
    },
    sizeGuideController.getSizeGuide.bind(sizeGuideController) as any
  );

  // Create new size guide
  fastify.post(
    "/size-guides",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Create a new size guide",
        tags: ["Size Guides"],
        summary: "Create Size Guide",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          properties: {
            title: { type: "string", minLength: 1 },
            bodyHtml: { type: "string" },
            region: { type: "string", enum: ["US", "UK", "EU", "ASIA"] },
            category: { type: "string" },
          },
          required: ["title", "region"],
        },
        response: {
          201: {
            description: "Size guide created successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  title: { type: "string" },
                  bodyHtml: { type: "string" },
                  region: { type: "string", enum: ["US", "UK", "EU", "ASIA"] },
                  category: { type: "string" },
                  created_at: { type: "string", format: "date-time" },
                  updated_at: { type: "string", format: "date-time" },
                },
              },
            },
          },
          400: {
            description: "Validation error",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string", example: "Validation failed" },
              code: { type: "string", example: "VALIDATION_ERROR" },
            },
          },
          ...authErrorResponses,
        },
      },
    },
    sizeGuideController.createSizeGuide.bind(sizeGuideController) as any
  );

  // Update size guide
  fastify.put(
    "/size-guides/:id",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Update an existing size guide",
        tags: ["Size Guides"],
        summary: "Update Size Guide",
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
            title: { type: "string", minLength: 1 },
            bodyHtml: { type: "string" },
            region: { type: "string", enum: ["US", "UK", "EU", "ASIA"] },
            category: { type: "string" },
          },
        },
        response: {
          200: {
            description: "Size guide updated successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  title: { type: "string" },
                  bodyHtml: { type: "string" },
                  region: { type: "string", enum: ["US", "UK", "EU", "ASIA"] },
                  category: { type: "string" },
                  created_at: { type: "string", format: "date-time" },
                  updated_at: { type: "string", format: "date-time" },
                },
              },
            },
          },
          404: {
            description: "Size guide not found",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string", example: "Size guide not found" },
              code: { type: "string", example: "SIZE_GUIDE_NOT_FOUND" },
            },
          },
          ...authErrorResponses,
        },
      },
    },
    sizeGuideController.updateSizeGuide.bind(sizeGuideController) as any
  );

  // Delete size guide
  fastify.delete(
    "/size-guides/:id",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Delete a size guide",
        tags: ["Size Guides"],
        summary: "Delete Size Guide",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
          },
          required: ["id"],
        },
        response: {
          200: {
            description: "Size guide deleted successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: {
                type: "string",
                example: "Size guide deleted successfully",
              },
            },
          },
          404: {
            description: "Size guide not found",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string", example: "Size guide not found" },
              code: { type: "string", example: "SIZE_GUIDE_NOT_FOUND" },
            },
          },
          ...authErrorResponses,
        },
      },
    },
    sizeGuideController.deleteSizeGuide.bind(sizeGuideController) as any
  );

  // =============================================================================
  // EDITORIAL LOOK ROUTES
  // =============================================================================

  // List editorial looks with filtering
  fastify.get(
    "/editorial-looks",
    {
      schema: {
        description:
          "Get paginated list of editorial looks with filtering options",
        tags: ["Editorial Looks"],
        summary: "List Editorial Looks",
        querystring: {
          type: "object",
          properties: {
            page: { type: "integer", minimum: 1, default: 1 },
            limit: { type: "integer", minimum: 1, maximum: 100, default: 20 },
            published: { type: "boolean" },
            scheduled: { type: "boolean" },
            draft: { type: "boolean" },
            hasContent: { type: "boolean" },
            hasHeroImage: { type: "boolean" },
            sortBy: {
              type: "string",
              enum: ["title", "publishedAt", "id"],
              default: "id",
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
    editorialLookController.getEditorialLooks.bind(editorialLookController)
  );

  // Get editorial look by ID
  fastify.get(
    "/editorial-looks/:id",
    {
      schema: {
        description: "Get editorial look by ID",
        tags: ["Editorial Looks"],
        summary: "Get Editorial Look",
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
          },
          required: ["id"],
        },
      },
    },
    editorialLookController.getEditorialLook.bind(editorialLookController)
  );

  // Create editorial look
  fastify.post(
    "/editorial-looks",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Create a new editorial look",
        tags: ["Editorial Looks"],
        summary: "Create Editorial Look",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["title"],
          properties: {
            title: { type: "string", maxLength: 200 },
            storyHtml: { type: "string", maxLength: 100000 },
            heroAssetId: { type: "string", format: "uuid" },
            publishedAt: { type: "string", format: "date-time" },
            productIds: {
              type: "array",
              items: { type: "string", format: "uuid" },
            },
          },
        },
      },
    },
    editorialLookController.createEditorialLook.bind(
      editorialLookController
    ) as any
  );

  // Update editorial look
  fastify.put(
    "/editorial-looks/:id",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Update an existing editorial look",
        tags: ["Editorial Looks"],
        summary: "Update Editorial Look",
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
            title: { type: "string", maxLength: 200 },
            storyHtml: { type: "string", maxLength: 100000 },
            heroAssetId: { type: "string", format: "uuid", nullable: true },
            publishedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
          },
        },
      },
    },
    editorialLookController.updateEditorialLook.bind(
      editorialLookController
    ) as any
  );

  // Delete editorial look
  fastify.delete(
    "/editorial-looks/:id",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Delete an editorial look",
        tags: ["Editorial Looks"],
        summary: "Delete Editorial Look",
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
    editorialLookController.deleteEditorialLook.bind(
      editorialLookController
    ) as any
  );

  // Publish editorial look
  fastify.post(
    "/editorial-looks/:id/publish",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Publish an editorial look immediately",
        tags: ["Editorial Looks"],
        summary: "Publish Editorial Look",
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
    editorialLookController.publishEditorialLook.bind(
      editorialLookController
    ) as any
  );

  // Unpublish editorial look
  fastify.post(
    "/editorial-looks/:id/unpublish",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Unpublish an editorial look",
        tags: ["Editorial Looks"],
        summary: "Unpublish Editorial Look",
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
    editorialLookController.unpublishEditorialLook.bind(
      editorialLookController
    ) as any
  );

  // Schedule editorial look publication
  fastify.post(
    "/editorial-looks/:id/schedule",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Schedule an editorial look for future publication",
        tags: ["Editorial Looks"],
        summary: "Schedule Editorial Look Publication",
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
          required: ["publishDate"],
          properties: {
            publishDate: { type: "string", format: "date-time" },
          },
        },
      },
    },
    editorialLookController.schedulePublication.bind(
      editorialLookController
    ) as any
  );

  // Get ready to publish looks
  fastify.get(
    "/editorial-looks/ready-to-publish",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Get editorial looks ready to be published",
        tags: ["Editorial Looks"],
        summary: "Get Ready to Publish Looks",
        security: [{ bearerAuth: [] }],
      },
    },
    editorialLookController.getReadyToPublishLooks.bind(
      editorialLookController
    ) as any
  );

  // Process scheduled publications
  fastify.post(
    "/editorial-looks/process-scheduled",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Process scheduled editorial look publications",
        tags: ["Editorial Looks"],
        summary: "Process Scheduled Publications",
        security: [{ bearerAuth: [] }],
      },
    },
    editorialLookController.processScheduledPublications.bind(
      editorialLookController
    ) as any
  );

  // Set hero image
  fastify.post(
    "/editorial-looks/:id/hero-image",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Set hero image for an editorial look",
        tags: ["Editorial Looks"],
        summary: "Set Hero Image",
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
          required: ["assetId"],
          properties: {
            assetId: { type: "string", format: "uuid" },
          },
        },
      },
    },
    editorialLookController.setHeroImage.bind(editorialLookController) as any
  );

  // Remove hero image
  fastify.delete(
    "/editorial-looks/:id/hero-image",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Remove hero image from an editorial look",
        tags: ["Editorial Looks"],
        summary: "Remove Hero Image",
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
    editorialLookController.removeHeroImage.bind(editorialLookController) as any
  );

  // Get looks by hero asset
  fastify.get(
    "/editorial-looks/by-hero-asset/:assetId",
    {
      schema: {
        description: "Get editorial looks using a specific hero asset",
        tags: ["Editorial Looks"],
        summary: "Get Looks by Hero Asset",
        params: {
          type: "object",
          properties: {
            assetId: { type: "string", format: "uuid" },
          },
          required: ["assetId"],
        },
      },
    },
    editorialLookController.getLooksByHeroAsset.bind(editorialLookController)
  );

  // Add product to look
  fastify.post(
    "/editorial-looks/:id/products/:productId",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Add a product to an editorial look",
        tags: ["Editorial Looks"],
        summary: "Add Product to Look",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            productId: { type: "string", format: "uuid" },
          },
          required: ["id", "productId"],
        },
      },
    },
    editorialLookController.addProductToLook.bind(
      editorialLookController
    ) as any
  );

  // Remove product from look
  fastify.delete(
    "/editorial-looks/:id/products/:productId",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Remove a product from an editorial look",
        tags: ["Editorial Looks"],
        summary: "Remove Product from Look",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            productId: { type: "string", format: "uuid" },
          },
          required: ["id", "productId"],
        },
      },
    },
    editorialLookController.removeProductFromLook.bind(
      editorialLookController
    ) as any
  );

  // Set look products (replace all)
  fastify.put(
    "/editorial-looks/:id/products",
    {
      preHandler: authenticateUser,
      schema: {
        description:
          "Set all products for an editorial look (replaces existing)",
        tags: ["Editorial Looks"],
        summary: "Set Look Products",
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
          required: ["productIds"],
          properties: {
            productIds: {
              type: "array",
              items: { type: "string", format: "uuid" },
            },
          },
        },
      },
    },
    editorialLookController.setLookProducts.bind(editorialLookController) as any
  );

  // Get look products
  fastify.get(
    "/editorial-looks/:id/products",
    {
      schema: {
        description: "Get all products associated with an editorial look",
        tags: ["Editorial Looks"],
        summary: "Get Look Products",
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
          },
          required: ["id"],
        },
      },
    },
    editorialLookController.getLookProducts.bind(editorialLookController)
  );

  // Get product's editorial looks (IDs only)
  fastify.get(
    "/products/:productId/editorial-looks/ids",
    {
      schema: {
        description: "Get IDs of editorial looks featuring a product",
        tags: ["Editorial Looks"],
        summary: "Get Product Look IDs",
        params: {
          type: "object",
          properties: {
            productId: { type: "string", format: "uuid" },
          },
          required: ["productId"],
        },
      },
    },
    editorialLookController.getProductLooks.bind(editorialLookController)
  );

  // Get product's editorial looks (full details)
  fastify.get(
    "/products/:productId/editorial-looks",
    {
      schema: {
        description: "Get all editorial looks featuring a product",
        tags: ["Editorial Looks"],
        summary: "Get Looks by Product",
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
            includeUnpublished: {
              type: "boolean",
              default: false,
              description:
                "Include unpublished/draft editorial looks in results",
            },
            sortBy: {
              type: "string",
              enum: ["title", "publishedAt", "id"],
              default: "id",
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
    editorialLookController.getLooksByProduct.bind(editorialLookController)
  );

  // Update story content
  fastify.patch(
    "/editorial-looks/:id/story",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Update story content for an editorial look",
        tags: ["Editorial Looks"],
        summary: "Update Story Content",
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
          required: ["storyHtml"],
          properties: {
            storyHtml: { type: "string", maxLength: 100000 },
          },
        },
      },
    },
    editorialLookController.updateStoryContent.bind(
      editorialLookController
    ) as any
  );

  // Clear story content
  fastify.delete(
    "/editorial-looks/:id/story",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Clear story content from an editorial look",
        tags: ["Editorial Looks"],
        summary: "Clear Story Content",
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
    editorialLookController.clearStoryContent.bind(
      editorialLookController
    ) as any
  );

  // Get editorial look statistics
  fastify.get(
    "/editorial-looks/statistics",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Get statistics about editorial looks",
        tags: ["Editorial Looks"],
        summary: "Get Editorial Look Statistics",
        security: [{ bearerAuth: [] }],
      },
    },
    editorialLookController.getEditorialLookStats.bind(
      editorialLookController
    ) as any
  );

  // Get popular products in editorial looks
  fastify.get(
    "/editorial-looks/popular-products",
    {
      schema: {
        description: "Get most featured products in editorial looks",
        tags: ["Editorial Looks"],
        summary: "Get Popular Products",
        querystring: {
          type: "object",
          properties: {
            limit: { type: "integer", minimum: 1, maximum: 50, default: 10 },
          },
        },
      },
    },
    editorialLookController.getPopularProducts.bind(editorialLookController)
  );

  // Bulk create editorial looks
  fastify.post(
    "/editorial-looks/bulk",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Create multiple editorial looks at once",
        tags: ["Editorial Looks"],
        summary: "Bulk Create Editorial Looks",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["looks"],
          properties: {
            looks: {
              type: "array",
              minItems: 1,
              maxItems: 20,
              items: {
                type: "object",
                required: ["title"],
                properties: {
                  title: { type: "string", maxLength: 200 },
                  storyHtml: { type: "string", maxLength: 100000 },
                  heroAssetId: { type: "string", format: "uuid" },
                  publishedAt: { type: "string", format: "date-time" },
                  productIds: {
                    type: "array",
                    items: { type: "string", format: "uuid" },
                  },
                },
              },
            },
          },
        },
      },
    },
    editorialLookController.createBulkEditorialLooks.bind(
      editorialLookController
    ) as any
  );

  // Bulk delete editorial looks
  fastify.delete(
    "/editorial-looks/bulk",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Delete multiple editorial looks at once",
        tags: ["Editorial Looks"],
        summary: "Bulk Delete Editorial Looks",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["ids"],
          properties: {
            ids: {
              type: "array",
              minItems: 1,
              maxItems: 50,
              items: { type: "string", format: "uuid" },
            },
          },
        },
      },
    },
    editorialLookController.deleteBulkEditorialLooks.bind(
      editorialLookController
    ) as any
  );

  // Bulk publish editorial looks
  fastify.post(
    "/editorial-looks/bulk-publish",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Publish multiple editorial looks at once",
        tags: ["Editorial Looks"],
        summary: "Bulk Publish Editorial Looks",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["ids"],
          properties: {
            ids: {
              type: "array",
              minItems: 1,
              maxItems: 20,
              items: { type: "string", format: "uuid" },
            },
          },
        },
      },
    },
    editorialLookController.publishBulkEditorialLooks.bind(
      editorialLookController
    ) as any
  );

  // Validate editorial look for publication
  fastify.get(
    "/editorial-looks/:id/validate",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Validate an editorial look for publication",
        tags: ["Editorial Looks"],
        summary: "Validate for Publication",
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
    editorialLookController.validateForPublication.bind(
      editorialLookController
    ) as any
  );

  // Duplicate editorial look
  fastify.post(
    "/editorial-looks/:id/duplicate",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Duplicate an editorial look with a new title",
        tags: ["Editorial Looks"],
        summary: "Duplicate Editorial Look",
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
          required: ["newTitle"],
          properties: {
            newTitle: { type: "string", maxLength: 200 },
          },
        },
      },
    },
    editorialLookController.duplicateEditorialLook.bind(
      editorialLookController
    ) as any
  );
}
