import { FastifyPluginAsync } from 'fastify';
import { ServiceContainer } from '../../apps/api/src/container';

// Controllers
import {
  ProductController,
  CategoryController,
  MediaController,
  VariantController,
  SearchController
} from './infra/http/controllers';

export interface ProductCatalogModuleDependencies {
  container: ServiceContainer;
}

const productCatalogModule: FastifyPluginAsync<ProductCatalogModuleDependencies> = async (
  fastify,
  options
) => {
  const { container } = options;

  // Register controllers using global container services
  const productController = new ProductController(
    container.productManagementService,
    container.productSearchService
  );
  const categoryController = new CategoryController(container.categoryManagementService);
  const mediaController = new MediaController(container.mediaManagementService);
  const variantController = new VariantController(container.variantManagementService);
  const searchController = new SearchController(container.productSearchService);

  // Register routes
  await fastify.register(async function productCatalogRoutes(fastify) {
    // Product routes
    fastify.get('/products', productController.getProducts.bind(productController));
    fastify.get('/products/:id', productController.getProduct.bind(productController));
    fastify.get('/products/slug/:slug', productController.getProductBySlug.bind(productController));
    fastify.post('/products', productController.createProduct.bind(productController));
    fastify.put('/products/:id', productController.updateProduct.bind(productController));
    fastify.delete('/products/:id', productController.deleteProduct.bind(productController));

    // Product variant routes
    fastify.get('/products/:productId/variants', variantController.getVariants.bind(variantController));
    fastify.get('/variants/:id', variantController.getVariant.bind(variantController));
    fastify.post('/products/:productId/variants', variantController.createVariant.bind(variantController));
    fastify.put('/variants/:id', variantController.updateVariant.bind(variantController));
    fastify.delete('/variants/:id', variantController.deleteVariant.bind(variantController));

    // Category routes
    fastify.get('/categories', categoryController.getCategories.bind(categoryController));
    fastify.get('/categories/:id', categoryController.getCategory.bind(categoryController));
    fastify.get('/categories/slug/:slug', categoryController.getCategoryBySlug.bind(categoryController));
    fastify.post('/categories', categoryController.createCategory.bind(categoryController));
    fastify.put('/categories/:id', categoryController.updateCategory.bind(categoryController));
    fastify.delete('/categories/:id', categoryController.deleteCategory.bind(categoryController));

    // Media routes
    fastify.get('/media', mediaController.getMediaAssets.bind(mediaController));
    fastify.get('/media/:id', mediaController.getMediaAsset.bind(mediaController));
    fastify.post('/media', mediaController.createMediaAsset.bind(mediaController));
    fastify.put('/media/:id', mediaController.updateMediaAsset.bind(mediaController));
    fastify.delete('/media/:id', mediaController.deleteMediaAsset.bind(mediaController));

    // Search routes
    fastify.get('/search', searchController.searchProducts.bind(searchController));
  }, { prefix: '/api/v1/catalog' });

  // Register product catalog dependencies for easy access
  fastify.decorate('productCatalog', {
    repositories: {
      product: container.productRepository,
      productVariant: container.productVariantRepository,
      category: container.categoryRepository,
      mediaAsset: container.mediaAssetRepository,
      productTag: container.productTagRepository,
    },
    services: {
      productManagement: container.productManagementService,
      categoryManagement: container.categoryManagementService,
      mediaManagement: container.mediaManagementService,
      variantManagement: container.variantManagementService,
      productSearch: container.productSearchService,
      slugGenerator: container.slugGeneratorService,
    },
  });
};

export default productCatalogModule;