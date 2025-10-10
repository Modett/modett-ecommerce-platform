# Complete Request Lifecycle Guide: From HTTP Route to Database and Back

## Complete Modett E-commerce Platform Request Processing Architecture

This comprehensive guide traces a complete HTTP request from the initial route registration through every layer of the architecture, with detailed industry terminology explanations and real code examples from the Modett e-commerce platform.

---

## PHASE 0: APPLICATION BOOTSTRAP & ROUTE REGISTRATION

### Step 0.1: Server Initialization & Fastify Instance Creation

**Location**: `apps/api/src/server.ts:16-33`

**Industry Terminology**:

- **Application Bootstrap**: The process of initializing and configuring an application at startup
- **Server Instance**: A single running instance of a web server application
- **Middleware Registration**: Adding functions that execute during request processing
- **Plugin Architecture**: Modular system where functionality is added through plugins
- **Trust Proxy**: Configuration for handling requests behind reverse proxies or load balancers

```typescript
export async function createServer(): Promise<FastifyInstance> {
  const server = fastify({
    logger: loggerConfig,           // ← Structured logging configuration
    trustProxy: true,               // ← Handle X-Forwarded-* headers
    ajv: {                          // ← JSON Schema validator configuration
      customOptions: {
        removeAdditional: "all",    // ← Remove extra properties from requests
        useDefaults: true,          // ← Apply default values from schemas
        coerceTypes: "array",       // ← Convert types when possible
        strict: false,              // ← Allow additional formats
      },
    },
  });
```

**Technical Terms Explained**:

- **AJV (Another JSON Schema Validator)**: High-performance JSON schema validator
- **Trust Proxy**: Tells server to trust proxy headers (X-Forwarded-For, X-Forwarded-Proto)
- **Coerce Types**: Automatically convert string "123" to number 123 based on schema
- **Remove Additional**: Strip properties not defined in schema
- **Structured Logging**: Consistent, machine-readable log format

### Step 0.2: Security & Rate Limiting Middleware Registration

**Location**: `apps/api/src/server.ts:35-68`

```typescript
await server.register(import("@fastify/cors"), {
  origin:
    process.env.NODE_ENV === "production"
      ? process.env.ALLOWED_ORIGINS?.split(",") || ["https://modett.com"]
      : true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-Guest-Token",
  ],
});

await server.register(import("@fastify/helmet"), {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
});

await server.register(import("@fastify/rate-limit"), {
  max: process.env.NODE_ENV === "production" ? 100 : 1000,
  timeWindow: "1 minute",
  skipOnError: true,
  addHeaders: {
    "x-ratelimit-limit": true,
    "x-ratelimit-remaining": true,
    "x-ratelimit-reset": true,
  },
});
```

**Industry Terminology**:

- **CORS (Cross-Origin Resource Sharing)**: Browser security feature that allows/blocks requests from different domains
- **CSP (Content Security Policy)**: Security header that prevents XSS attacks by controlling resource loading
- **Rate Limiting**: Technique to limit the number of requests from a client within a time window
- **Helmet**: Security middleware that sets various HTTP headers
- **Preflight Request**: OPTIONS request sent by browsers for certain CORS requests

**Security Headers Explained**:

- **Origin**: Which domains can make requests to your API
- **Credentials**: Whether cookies/auth headers are sent with cross-origin requests
- **defaultSrc**: Default policy for loading resources
- **styleSrc**: Policy for CSS stylesheets
- **scriptSrc**: Policy for JavaScript execution
- **X-RateLimit-\***: Headers informing client about rate limit status

### Step 0.3: Service Container Initialization

**Location**: `apps/api/src/server.ts:419-420`

```typescript
const { createServiceContainer } = await import("./container");
const serviceContainer = createServiceContainer();
```

**Industry Terminology**:

- **Service Container**: Central registry that manages dependency injection and service instantiation
- **Dependency Injection Container**: Design pattern for managing object dependencies
- **Service Locator**: Pattern for obtaining service instances
- **Inversion of Control (IoC)**: Principle where control flow is inverted to container

**Container Pattern Benefits**:

- **Centralized Configuration**: All service creation logic in one place
- **Lifecycle Management**: Container manages service creation and destruction
- **Dependency Resolution**: Automatically resolves service dependencies
- **Testability**: Easy to mock services for testing

### Step 0.4: Module Route Registration

**Location**: `apps/api/src/server.ts:439-461`

```typescript
const { registerProductCatalogRoutes } = await import(
  "../../../modules/product-catalog/infra/http/routes"
);

const productCatalogServices = {
  productService: serviceContainer.productManagementService,
  productSearchService: serviceContainer.productSearchService,
  categoryService: serviceContainer.categoryManagementService,
  variantService: serviceContainer.variantManagementService,
  mediaService: serviceContainer.mediaManagementService,
  productTagService: serviceContainer.productTagManagementService,
  sizeGuideService: serviceContainer.sizeGuideManagementService,
  editorialLookService: serviceContainer.editorialLookManagementService,
};

await server.register(
  async function (fastify) {
    await registerProductCatalogRoutes(fastify, productCatalogServices);
  },
  { prefix: "/api/v1/catalog" }
);
```

**Industry Terminology**:

- **Module Registration**: Process of adding functionality modules to the main application
- **Route Prefix**: URL path segment added to all routes within a module
- **Service Injection**: Passing service instances to route handlers
- **Modular Monolith**: Architecture where application is organized into modules but deployed as single unit
- **Plugin Registration**: Fastify's way of registering groups of routes and middleware

### Step 0.5: Individual Route Registration

**Location**: `modules/product-catalog/infra/http/routes.ts:82-137`

```typescript
fastify.get(
  "/products", // ← HTTP Path
  {
    schema: {
      // ← OpenAPI/JSON Schema definition
      description: "Get paginated list of products with filtering options",
      tags: ["Products"], // ← Swagger UI grouping
      summary: "List Products", // ← Short description
      querystring: {
        // ← Query parameter validation schema
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
        // ← Response schema for documentation and validation
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
  productController.listProducts.bind(productController) // ← Handler function binding
);
```

**Industry Terminology**:

- **Route Definition**: Specification of HTTP method, path, middleware, and handler
- **JSON Schema**: Standard for validating JSON data structure
- **OpenAPI Specification**: Standard for describing REST APIs
- **Method Binding**: Ensuring `this` context is preserved when passing methods as callbacks
- **Schema-First Development**: Defining API contracts before implementation
- **Request Validation**: Automatic validation of incoming request data against schema
- **Response Validation**: Optional validation of outgoing response data

**Schema Definition Components**:

- **Query Parameters**: Data passed in URL query string (?page=1&limit=20)
- **Path Parameters**: Variables in URL path (/products/:id)
- **Request Body**: JSON data sent in POST/PUT requests
- **Response Schema**: Structure of successful and error responses
- **Enum Values**: Limited set of allowed values
- **Format Validators**: Built-in validators (uuid, date-time, email)

---

## PHASE 1: HTTP REQUEST PROCESSING PIPELINE

### Step 1.1: TCP Connection & HTTP Request Reception

**Industry Terminology**:

- **TCP (Transmission Control Protocol)**: Reliable, connection-oriented network protocol
- **HTTP (HyperText Transfer Protocol)**: Application-layer protocol for web communication
- **Request Line**: First line of HTTP request (GET /api/v1/catalog/products HTTP/1.1)
- **HTTP Headers**: Metadata about the request (Content-Type, Authorization, User-Agent)
- **Keep-Alive**: HTTP feature that reuses TCP connections for multiple requests

**Client Request Example**:

```
GET /api/v1/catalog/products?page=1&limit=20&status=published HTTP/1.1
Host: localhost:3000
Accept: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
Content-Type: application/json
Connection: keep-alive
```

**Technical Flow**:

1. **DNS Resolution**: Client resolves `localhost` to `127.0.0.1`
2. **TCP Handshake**: Three-way handshake establishes connection
3. **TLS Handshake** (if HTTPS): Encrypted connection establishment
4. **HTTP Request Transmission**: Request data sent over established connection

### Step 1.2: Fastify Request Processing Pipeline

**Location**: Fastify core processing

**Industry Terminology**:

- **Request Parsing**: Converting raw HTTP data into structured request object
- **URL Parsing**: Breaking down URL into components (protocol, host, path, query)
- **Query Parameter Parsing**: Converting query string into key-value pairs
- **Header Parsing**: Processing HTTP headers into accessible format

**Fastify Internal Processing**:

```typescript
// Conceptual Fastify internal flow
const request = {
  method: "GET",
  url: "/api/v1/catalog/products",
  query: { page: "1", limit: "20", status: "published" },
  headers: {
    host: "localhost:3000",
    accept: "application/json",
    authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user-agent": "Mozilla/5.0...",
    "content-type": "application/json",
  },
  params: {}, // Will be populated if route has path parameters
  body: null, // No body for GET requests
};
```

### Step 1.3: Route Matching & Handler Resolution

**Industry Terminology**:

- **Route Matching**: Process of finding which route definition matches the incoming request
- **Path Pattern Matching**: Comparing request path against registered route patterns
- **HTTP Method Matching**: Ensuring request method (GET, POST, etc.) matches route definition
- **Route Parameters**: Dynamic segments in URL paths (e.g., `/products/:id`)
- **Handler Resolution**: Determining which function should process the request

**Route Matching Process**:

1. **Method Check**: Verify HTTP method matches (GET)
2. **Path Matching**: Match `/api/v1/catalog/products` against registered routes
3. **Middleware Chain**: Identify middleware that should run for this route
4. **Handler Selection**: Select `productController.listProducts` as final handler

### Step 1.4: Security Middleware Execution

**CORS (Cross-Origin Resource Sharing) Processing**:

```typescript
// Fastify CORS middleware checks
if (request.headers.origin) {
  const allowedOrgins = ["http://localhost:3000", "https://modett.com"];
  if (allowedOrgins.includes(request.headers.origin)) {
    reply.header("Access-Control-Allow-Origin", request.headers.origin);
    reply.header("Access-Control-Allow-Credentials", "true");
  }
}
```

**Rate Limiting Processing**:

```typescript
// Rate limiting check (conceptual)
const clientKey = request.ip;
const currentRequests = rateLimitStore.get(clientKey) || 0;
if (currentRequests >= 100) {
  return reply.code(429).send({
    error: "Too Many Requests",
    retryAfter: 60,
  });
}
rateLimitStore.set(clientKey, currentRequests + 1, 60); // 60 second TTL
```

**Industry Terminology**:

- **Rate Limiting**: Controlling request frequency to prevent abuse
- **Token Bucket Algorithm**: Rate limiting strategy using virtual tokens
- **IP-based Limiting**: Rate limiting based on client IP address
- **429 Too Many Requests**: HTTP status code for rate limit exceeded

### Step 1.5: Request Validation (Schema Validation)

**Location**: Fastify AJV integration

**Query Parameter Validation**:

```typescript
// Schema from route definition
const querySchema = {
  type: "object",
  properties: {
    page: { type: "integer", minimum: 1, default: 1 },
    limit: { type: "integer", minimum: 1, maximum: 100, default: 20 },
    status: { type: "string", enum: ["draft", "published", "scheduled"] },
    categoryId: { type: "string", format: "uuid" },
    brand: { type: "string" },
    sortBy: {
      type: "string",
      enum: ["title", "createdAt", "updatedAt", "publishAt"],
      default: "createdAt",
    },
    sortOrder: { type: "string", enum: ["asc", "desc"], default: "desc" },
  },
};

// AJV validation process (conceptual)
const validate = ajv.compile(querySchema);
const queryParams = {
  page: "1", // String from URL
  limit: "20", // String from URL
  status: "published",
};

// AJV transforms and validates
const valid = validate(queryParams);
if (!valid) {
  throw new ValidationError(validate.errors);
}

// After validation and coercion:
const validatedQuery = {
  page: 1, // Coerced to number
  limit: 20, // Coerced to number
  status: "published",
  sortBy: "createdAt", // Default applied
  sortOrder: "desc", // Default applied
};
```

**Industry Terminology**:

- **Schema Validation**: Checking data structure against predefined rules
- **Type Coercion**: Automatic conversion between data types
- **Default Value Application**: Setting default values for missing properties
- **Enum Validation**: Ensuring values are from allowed set
- **Format Validation**: Validating specific formats (UUID, email, date)
- **Boundary Validation**: Checking minimum/maximum values

**Validation Error Handling**:

```typescript
// If validation fails
{
  "success": false,
  "error": "Request validation failed",
  "errors": [
    "query/page must be >= 1",
    "query/status must be one of: draft, published, scheduled"
  ],
  "code": "VALIDATION_ERROR",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

## PHASE 2: PRESENTATION LAYER (HTTP Controller)

### Step 2.1: Controller Method Invocation

**Location**: `modules/product-catalog/infra/http/controllers/product.controller.ts:69-119`

**Industry Terminology**:

- **Controller**: Component that handles HTTP requests and responses
- **Method Binding**: Ensuring correct `this` context when calling methods
- **Request/Response Objects**: Abstractions over HTTP request and response
- **HTTP Status Codes**: Standardized response codes (200 OK, 404 Not Found, 500 Internal Server Error)

```typescript
async listProducts(
  request: FastifyRequest<{ Querystring: ProductQueryParams }>,
  reply: FastifyReply
) {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      brand,
      categoryId,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = request.query;  // ← Destructuring validated query parameters
```

**Destructuring Assignment**:

- **ES6 Feature**: Extracting values from objects/arrays into variables
- **Default Values**: Providing fallback values if property is undefined
- **Type Safety**: TypeScript ensures correct types based on generic parameters

### Step 2.2: Input Sanitization & Business Rule Application

**Location**: `modules/product-catalog/infra/http/controllers/product.controller.ts:104-113`

```typescript
// Create list products query with sanitized inputs
const query: ListProductsQuery = {
  page: Math.max(1, page), // ← Ensure page >= 1
  limit: Math.min(100, Math.max(1, limit)), // ← Clamp limit between 1-100
  status,
  brand,
  categoryId,
  sortBy,
  sortOrder,
};
```

**Industry Terminology**:

- **Input Sanitization**: Cleaning and validating input data
- **Boundary Checking**: Ensuring values don't exceed limits
- **Clamping**: Restricting values to specific ranges
- **Business Rules**: Domain-specific constraints and logic

**Sanitization Techniques**:

- **Math.max(1, page)**: Ensures page is at least 1
- **Math.min(100, Math.max(1, limit))**: Clamps limit between 1 and 100
- **Default Values**: Providing safe fallbacks for missing data

### Step 2.3: DTO (Data Transfer Object) Creation

**DTO Characteristics**:

```typescript
export interface ListProductsQuery extends IQuery {
  page?: number;
  limit?: number;
  categoryId?: string;
  brand?: string;
  status?: "draft" | "published" | "scheduled";
  sortBy?: "title" | "createdAt" | "updatedAt" | "publishAt";
  sortOrder?: "asc" | "desc";
}
```

**Industry Terminology**:

- **DTO (Data Transfer Object)**: Simple object for carrying data between processes
- **Plain Object**: Object containing only data, no methods
- **Serializable**: Can be converted to JSON easily
- **Immutable**: Typically not modified after creation
- **Type-Safe**: Uses TypeScript interfaces for compile-time checking
- **Interface**: Contract defining object structure
- **Optional Properties**: Properties that may or may not be present (?)

**DTO Benefits**:

- **Decoupling**: Separates API layer from domain layer
- **Versioning**: Can evolve independently of domain models
- **Validation**: Provides structure for input validation
- **Documentation**: Serves as API contract documentation

❌ **NO ENTITIES YET** - Still working with plain data structures

---

## PHASE 3: APPLICATION LAYER (CQRS Handler)

### Step 3.1: Handler Invocation

**Location**: `modules/product-catalog/infra/http/controllers/product.controller.ts:116`

```typescript
const result = await this.listProductsHandler.handle(query);
```

**Industry Terminology**:

- **CQRS (Command Query Responsibility Segregation)**: Pattern separating read and write operations
- **Handler Pattern**: Dedicated objects for handling specific operations
- **Application Service**: Coordinates business operations without containing business logic
- **Use Case**: Single, specific business operation
- **Orchestration**: Coordinating multiple services to complete an operation

### Step 3.2: Handler Implementation

**Location**: `modules/product-catalog/application/queries/list-products.query.ts:48-60`

```typescript
export class ListProductsHandler
  implements IQueryHandler<ListProductsQuery, CommandResult<ListProductsResult>>
{
  constructor(
    private readonly productManagementService: ProductManagementService
  ) {}

  async handle(
    query: ListProductsQuery
  ): Promise<CommandResult<ListProductsResult>> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 20;
```

**Industry Terminology**:

- **Dependency Injection (DI)**: Providing dependencies through constructor
- **Interface Implementation**: Adhering to a contract (implements IQueryHandler)
- **Generic Type Constraints**: Making handler reusable with different types
- **Readonly Modifier**: Prevents reassignment after construction
- **Private Access Modifier**: Encapsulates service, inaccessible outside class

**SOLID Principles Applied**:

- **Single Responsibility**: Handler only handles one type of query
- **Dependency Inversion**: Depends on interface, not concrete implementation
- **Interface Segregation**: Implements minimal required interface

### Step 3.3: Service Layer Delegation

**Location**: `modules/product-catalog/application/queries/list-products.query.ts:65-76`

```typescript
const products = await this.productManagementService.getAllProducts({
  page,
  limit,
  categoryId: query.categoryId,
  brand: query.brand,
  status: query.status,
  sortBy: query.sortBy,
  sortOrder: query.sortOrder,
});
```

**Industry Terminology**:

- **Delegation**: Passing responsibility to another component
- **Async/Await**: JavaScript syntax for handling asynchronous operations
- **Promise**: Object representing eventual completion of async operation
- **Service Layer**: Business logic coordination layer

❌ **NO ENTITIES YET** - Handler passes plain data to service

---

## PHASE 4: DOMAIN SERVICE LAYER

### Step 4.1: Service Method Execution

**Location**: `modules/product-catalog/application/services/product-management.service.ts:89-108`

```typescript
async getAllProducts(
  options?: ProductQueryOptions & {
    page?: number;
    limit?: number;
    categoryId?: string;
    brand?: string;
    status?: string;
  }
): Promise<{ items: Product[]; totalCount: number }> {
  const {
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
    includeDrafts = true,
    categoryId,
    brand,
    status,
  } = options || {};

  const offset = (page - 1) * limit;  // ← Calculate database offset
```

**Industry Terminology**:

- **Domain Service**: Coordinates complex business operations
- **Pagination**: Dividing large datasets into smaller pages
- **Offset**: Starting position for retrieving records
- **Limit**: Maximum number of records to return
- **Intersection Type (&)**: TypeScript feature combining multiple types
- **Optional Parameters**: Parameters that may be omitted (?)

**Pagination Mathematics**:

- **Page 1, Limit 20**: Offset = (1-1) \* 20 = 0 (records 1-20)
- **Page 2, Limit 20**: Offset = (2-1) \* 20 = 20 (records 21-40)
- **Page 3, Limit 20**: Offset = (3-1) \* 20 = 40 (records 41-60)

### Step 4.2: Repository Query Strategy Selection

**Location**: `modules/product-catalog/application/services/product-management.service.ts:115-170`

```typescript
if (categoryId) {
  // Filter by category
  const queryOptions: ProductQueryOptions = {
    limit,
    offset,
    sortBy,
    sortOrder,
    includeDrafts: status === "draft" || includeDrafts,
  };

  products = await this.productRepository.findByCategory(
    categoryId,
    queryOptions
  );
  totalCount = await this.productRepository.count({ categoryId });
} else if (brand) {
  // Filter by brand
  const queryOptions: ProductQueryOptions = {
    limit,
    offset,
    sortBy,
    sortOrder,
    includeDrafts: status === "draft" || includeDrafts,
  };

  products = await this.productRepository.findByBrand(brand, queryOptions);
  totalCount = await this.productRepository.count({ brand });
} else if (status) {
  // Filter by status
  const queryOptions: ProductQueryOptions = {
    limit,
    offset,
    sortBy,
    sortOrder,
    includeDrafts: status === "draft" || includeDrafts,
  };

  products = await this.productRepository.findByStatus(status, queryOptions);
  totalCount = await this.productRepository.count({ status });
} else {
  // Get all products
  const queryOptions: ProductQueryOptions = {
    limit,
    offset,
    sortBy,
    sortOrder,
    includeDrafts,
  };

  products = await this.productRepository.findAll(queryOptions);
  totalCount = await this.productRepository.count();
}
```

**Industry Terminology**:

- **Query Strategy Pattern**: Selecting different query approaches based on input
- **Repository Pattern**: Abstraction for data access operations
- **Conditional Logic**: if-else statements for different execution paths
- **Query Optimization**: Choosing most efficient query method
- **Separate Concerns**: Different repository methods for different query types

**Repository Interface Methods**:

```typescript
export interface IProductRepository {
  findAll(options?: ProductQueryOptions): Promise<Product[]>;
  findByStatus(
    status: string,
    options?: ProductQueryOptions
  ): Promise<Product[]>;
  findByBrand(brand: string, options?: ProductQueryOptions): Promise<Product[]>;
  findByCategory(
    categoryId: string,
    options?: ProductQueryOptions
  ): Promise<Product[]>;
  count(filters?: any): Promise<number>;
}
```

**Benefits of Strategy Pattern**:

- **Performance**: Uses most efficient query for each scenario
- **Maintainability**: Each query type is handled separately
- **Testability**: Each strategy can be tested independently
- **Extensibility**: Easy to add new query strategies

❌ **NO ENTITIES YET** - Service layer calls repository but hasn't received response

---

## PHASE 5: PERSISTENCE LAYER (DATABASE INTERACTION)

### Step 5.1: ORM Query Construction

**Location**: `modules/product-catalog/infra/persistence/repositories/product.repository.impl.ts:192-235`

**Industry Terminology**:

- **ORM (Object-Relational Mapping)**: Technique for converting between object-oriented and relational systems
- **Prisma**: Modern TypeScript ORM for Node.js
- **Query Builder**: API for constructing database queries programmatically
- **Where Clause**: SQL condition filtering which records to retrieve
- **Join Operation**: Combining data from multiple tables

```typescript
async findByCategory(categoryId: string, options?: ProductQueryOptions): Promise<Product[]> {
  const {
    limit = 50,
    offset = 0,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    includeDrafts = false,
  } = options || {};

  const whereClause: any = {
    categories: {
      some: {                    // ← At least one related record matches
        categoryId: categoryId,
      },
    },
  };

  if (!includeDrafts) {
    whereClause.status = { in: ['published', 'scheduled'] };
  }

  const products = await this.prisma.product.findMany({
    where: whereClause,
    take: limit,              // ← SQL LIMIT
    skip: offset,             // ← SQL OFFSET
    orderBy: { [sortBy]: sortOrder },  // ← SQL ORDER BY
  });
```

**SQL Translation (Conceptual)**:

```sql
SELECT
  p.id, p.title, p.slug, p.brand, p.short_desc,
  p.long_desc_html, p.status, p.publish_at,
  p.country_of_origin, p.seo_title, p.seo_description,
  p.created_at, p.updated_at
FROM products p
INNER JOIN product_categories pc ON p.id = pc.product_id
WHERE
  pc.category_id = 'abc-123'
  AND p.status IN ('published', 'scheduled')
ORDER BY p.created_at DESC
LIMIT 20
OFFSET 0;
```

**Database Terminology**:

- **INNER JOIN**: Returns records that have matching values in both tables
- **Foreign Key**: Field referencing primary key of another table
- **Many-to-Many Relationship**: Products can have many categories, categories can have many products
- **Index**: Data structure improving query performance
- **Primary Key**: Unique identifier for table rows

### Step 5.2: Database Query Execution

**Database Internal Process**:

1. **Query Parsing**: Database parses SQL query
2. **Query Optimization**: Database determines most efficient execution plan
3. **Index Usage**: Database uses indexes to quickly locate matching rows
4. **Data Retrieval**: Database reads data from disk/memory
5. **Result Set Formation**: Database assembles matching rows into result set

**Industry Terminology**:

- **Query Execution Plan**: Strategy database uses to execute query
- **Index Seek**: Using index to jump directly to matching rows (fast)
- **Table Scan**: Reading every row in table (slow)
- **Cost-Based Optimizer**: System that chooses execution plan with lowest estimated cost
- **Buffer Pool**: Memory area where database caches frequently accessed data

**Example Database Response**:

```javascript
[
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    title: "Nike Air Max 270",
    slug: "nike-air-max-270",
    brand: "Nike",
    shortDesc: "Comfortable running shoes",
    long_desc_html: "<p>Detailed description...</p>",
    status: "published",
    publish_at: new Date("2025-01-15T10:30:00.000Z"),
    country_of_origin: "Vietnam",
    seo_title: "Nike Air Max 270 - Best Running Shoes",
    seo_description: "Shop the Nike Air Max 270...",
    created_at: new Date("2025-01-10T08:00:00.000Z"),
    updated_at: new Date("2025-01-10T08:00:00.000Z"),
  },
  // ... more rows
];
```

### Step 5.3: ✅ ENTITY HYDRATION (RECONSTITUTION)

**This is where entities are CREATED from database data!**

**Location**: `modules/product-catalog/infra/persistence/repositories/product.repository.impl.ts:220-234`

```typescript
return products.map((productData) =>
  Product.fromDatabaseRow({
    product_id: productData.id,
    title: productData.title,
    slug: productData.slug,
    brand: productData.brand,
    short_desc: productData.shortDesc,
    long_desc_html: productData.longDescHtml,
    status: productData.status as any,
    publish_at: productData.publishAt,
    country_of_origin: productData.countryOfOrigin,
    seo_title: productData.seoTitle,
    seo_description: productData.seoDescription,
    created_at: productData.createdAt,
    updated_at: productData.updatedAt,
  })
);
```

**Industry Terminology**:

- **Hydration/Reconstitution**: Converting raw database records into rich domain entities
- **Factory Method**: Static method that creates instances of a class
- **Value Object**: Immutable object representing domain concept (ProductId, Slug)
- **Domain Entity**: Object with unique identity and business behavior
- **Object Mapping**: Converting between different object representations

**Entity Factory Method**:

```typescript
// Location: modules/product-catalog/domain/entities/product.entity.ts:67-83
static fromDatabaseRow(row: ProductRow): Product {
  return new Product(
    ProductId.fromString(row.product_id),      // ← Value Object creation
    row.title,
    Slug.fromString(row.slug),                 // ← Value Object creation
    row.brand,
    row.short_desc,
    row.long_desc_html,
    row.status,
    row.publish_at,
    row.country_of_origin,
    row.seo_title,
    row.seo_description,
    row.created_at,
    row.updated_at
  );
}
```

**Entity Structure**:

```typescript
export class Product {
  private constructor(              // ← Private: forces use of factory methods
    private readonly id: ProductId,  // ← Readonly: ID never changes
    private title: string,           // ← Private: accessed via getters
    private slug: Slug,
    private brand: string | null,
    private shortDesc: string | null,
    private longDescHtml: string | null,
    private status: ProductStatus,
    private publishAt: Date | null,
    private countryOfOrigin: string | null,
    private seoTitle: string | null,
    private seoDescription: string | null,
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {}
```

**Design Patterns Applied**:

- **Encapsulation**: All properties are private
- **Information Hiding**: Internal state protected
- **Factory Pattern**: Static method for creation
- **Immutable Properties**: Some properties can't be changed (id, createdAt)
- **Value Objects**: ProductId and Slug are value objects

✅ **ENTITIES NOW EXIST** - Array of Product entities with full business logic capabilities

---

## PHASE 6: DOMAIN SERVICE RETURN

### Step 6.1: Service Receives Entities

**Location**: `modules/product-catalog/application/services/product-management.service.ts:170-173`

```typescript
return {
  items: products, // ← Array of Product entities
  totalCount,
};
```

**What the Service Could Do with Entities**:

The service layer could invoke business logic methods on entities:

```typescript
// Hypothetical service method demonstrating entity usage
async publishAllDrafts(categoryId: string): Promise<void> {
  const draftProducts = await this.productRepository.findByCategory(
    categoryId,
    { includeDrafts: true }
  );

  for (const product of draftProducts) {
    if (product.isDraft() && product.canBePublished()) {
      product.publish();  // ← Calling entity business logic!
      await this.productRepository.update(product);
    }
  }
}
```

**Available Business Logic Methods**:

```typescript
// Business operations
product.updateTitle("New Title"); // Updates title & regenerates slug
product.updateBrand("Nike"); // Updates brand
product.publish(); // Changes status to published
product.unpublish(); // Changes status to draft
product.schedulePublication(futureDate); // Schedules for future publication

// Validation methods
product.isPublished(); // Returns boolean
product.isDraft(); // Returns boolean
product.canBePublished(); // Validates if publishable
product.shouldBePublishedNow(); // Checks if scheduled time has passed
```

**Industry Terminology**:

- **Business Logic**: Rules determining how data is created, stored, and changed
- **Domain Invariants**: Rules that must always be true
- **State Transitions**: Moving from one status to another (draft → published)
- **Side Effects**: Changes occurring as result of an operation
- **Aggregate**: Cluster of entities treated as single unit

✅ **ENTITIES USED** - Service layer returns entities to handler

---

## PHASE 7: APPLICATION LAYER RETURN (Entity-to-DTO Transformation)

### Step 7.1: Entity Mapping to DTOs

**Location**: `modules/product-catalog/application/queries/list-products.query.ts:73-89`

**Why Transform Entities to DTOs?**

1. **Encapsulation**: Don't expose internal entity structure
2. **Serialization**: Entities may contain objects that can't be serialized
3. **Decoupling**: API format can change independently of domain model
4. **Security**: Control exactly what data is exposed
5. **Performance**: Send only necessary data

```typescript
const productResults: ProductResult[] = products.items.map(
  (product: Product) => ({
    // ← product is a Product Entity!
    productId: product.getId().toString(), // ← Calling getter, converting Value Object to string
    title: product.getTitle(), // ← Calling getter
    slug: product.getSlug().toString(), // ← Calling getter, converting Value Object to string
    brand: product.getBrand() ?? undefined, // ← Calling getter, converting null to undefined
    shortDesc: product.getShortDesc() ?? undefined,
    longDescHtml: product.getLongDescHtml() ?? undefined,
    status: product.getStatus(), // ← Calling getter
    publishAt: product.getPublishAt() ?? undefined,
    countryOfOrigin: product.getCountryOfOrigin() ?? undefined,
    seoTitle: product.getSeoTitle() ?? undefined,
    seoDescription: product.getSeoDescription() ?? undefined,
    createdAt: product.getCreatedAt(), // ← Calling getter
    updatedAt: product.getUpdatedAt(), // ← Calling getter
  })
);
```

**Industry Terminology**:

- **Mapping/Projection**: Converting from one data structure to another
- **Nullish Coalescing Operator (??)**: Returns right operand if left is null/undefined
- **Method Call**: Invoking methods on objects
- **Getter Methods**: Methods returning private property values
- **Value Object Conversion**: Converting value objects to primitives

**Entity vs DTO Comparison**:

| Entity                  | DTO                         |
| ----------------------- | --------------------------- |
| Has business methods    | No methods, just data       |
| Mutable (can change)    | Typically immutable         |
| Uses Value Objects      | Uses primitives             |
| Enforces business rules | Basic structure validation  |
| May not be serializable | Easily serializable to JSON |

**Entity Getter Examples**:

```typescript
getId(): ProductId {
  return this.id;  // Returns Value Object
}

getTitle(): string {
  return this.title;  // Returns primitive string
}

getSlug(): Slug {
  return this.slug;  // Returns Value Object
}

getBrand(): string | null {
  return this.brand;  // Returns primitive string or null
}
```

### Step 7.2: Result Wrapping

**Location**: `modules/product-catalog/application/queries/list-products.query.ts:91-98`

```typescript
const result: ListProductsResult = {
  products: productResults, // Array of DTOs
  totalCount: products.totalCount,
  page,
  limit,
};

return CommandResult.success<ListProductsResult>(result);
```

**Industry Terminology**:

- **Result Object Pattern**: Wrapping return values with success/failure indicators
- **Generic Type Parameter**: Specifying type of data in result
- **Metadata**: Information about the data (totalCount, page, limit)

**CommandResult Structure**:

```typescript
class CommandResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: string[];

  static success<T>(data: T): CommandResult<T> {
    return {
      success: true,
      data: data,
    };
  }

  static failure<T>(error: string, errors?: string[]): CommandResult<T> {
    return {
      success: false,
      error: error,
      errors: errors,
    };
  }
}
```

✅ **ENTITIES USED** - Transformed into DTOs and returned to controller

---

## PHASE 8: PRESENTATION LAYER RESPONSE

### Step 8.1: Response Formatting

**Location**: `modules/product-catalog/infra/http/controllers/product.controller.ts:140-149`

```typescript
if (result.success && result.data) {
  return reply.code(200).send({
    success: true,
    data: {
      products: result.data.products, // ← DTOs, NOT entities
      total: result.data.totalCount,
      page: result.data.page,
      limit: result.data.limit,
    },
  });
}
```

**Industry Terminology**:

- **HTTP Status Codes**: Numeric codes indicating request result
  - **200 OK**: Request succeeded
  - **201 Created**: New resource created
  - **400 Bad Request**: Invalid input
  - **404 Not Found**: Resource doesn't exist
  - **500 Internal Server Error**: Server error
- **Response Body**: Data sent back to client
- **JSON Serialization**: Converting objects to JSON format

### Step 8.2: JSON Serialization Process

**Before Serialization (JavaScript Object)**:

```javascript
{
  success: true,
  data: {
    products: [
      {
        productId: "550e8400-e29b-41d4-a716-446655440000",
        title: "Nike Air Max 270",
        slug: "nike-air-max-270",
        brand: "Nike",
        status: "published",
        createdAt: Date object,  // JavaScript Date object
        updatedAt: Date object
      }
    ],
    total: 42,
    page: 1,
    limit: 20
  }
}
```

**After JSON Serialization (String)**:

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "productId": "550e8400-e29b-41d4-a716-446655440000",
        "title": "Nike Air Max 270",
        "slug": "nike-air-max-270",
        "brand": "Nike",
        "status": "published",
        "createdAt": "2025-01-10T08:00:00.000Z",
        "updatedAt": "2025-01-10T08:00:00.000Z"
      }
    ],
    "total": 42,
    "page": 1,
    "limit": 20
  }
}
```

**Industry Terminology**:

- **JSON (JavaScript Object Notation)**: Text-based data interchange format
- **String Encoding**: Converting characters to bytes (usually UTF-8)
- **Content-Type Header**: Specifies response format (application/json)
- **Date Serialization**: Converting Date objects to ISO 8601 strings

### Step 8.3: Complete HTTP Response Transmission

**Complete HTTP Response**:

```
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 1234
Date: Fri, 15 Jan 2025 10:30:00 GMT
Connection: keep-alive
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1642248600

{"success":true,"data":{"products":[{"productId":"550e8400..."}],"total":42,"page":1,"limit":20}}
```

**Industry Terminology**:

- **Status Line**: First line of response (HTTP/1.1 200 OK)
- **Response Headers**: Metadata about response
- **Response Body**: Actual JSON data
- **Content-Length**: Size of response body in bytes
- **Keep-Alive**: HTTP connection remains open for subsequent requests

❌ **NO ENTITIES** - Only serialized DTOs sent to client

---

## COMPLETE VISUAL FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser/Mobile App)                   │
│                   HTTP GET /api/v1/catalog/products?page=1       │
└──────────────────────────────┬──────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PHASE 0: APPLICATION BOOTSTRAP                 │
│                       Files: server.ts, routes.ts                │
├─────────────────────────────────────────────────────────────────┤
│ • Server initialization & Fastify instance creation              │
│ • Security middleware registration (CORS, Helmet, Rate Limiting) │
│ • Service container initialization                                │
│ • Module route registration with URL prefixes                    │
│ • Individual route registration with schema validation           │
│                                                                  │
│ Data Type: Route Definitions & Middleware Stack                  │
└──────────────────────────────┬──────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              PHASE 1: HTTP REQUEST PROCESSING PIPELINE           │
│                       Files: Fastify Core                        │
├─────────────────────────────────────────────────────────────────┤
│ • TCP connection & HTTP request reception                        │
│ • Request parsing (URL, headers, query parameters)              │
│ • Route matching & handler resolution                            │
│ • Security middleware execution (CORS, Rate Limiting)           │
│ • Request validation with AJV schema validation                  │
│                                                                  │
│ Data Type: Validated HTTP Request Object                         │
└──────────────────────────────┬──────────────────────────────────┘
                                 │ Validated Request
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              PHASE 2: PRESENTATION LAYER (Controller)            │
│                  File: product.controller.ts:69                  │
├─────────────────────────────────────────────────────────────────┤
│ ❌ NO ENTITIES                                                   │
│                                                                  │
│ • Controller method invocation                                   │
│ • Input sanitization & business rule application                 │
│ • DTO creation                                                   │
│                                                                  │
│ Data Type: ListProductsQuery DTO                                 │
└──────────────────────────────┬──────────────────────────────────┘
                                 │ ListProductsQuery DTO
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│           PHASE 3: APPLICATION LAYER (CQRS Handler)              │
│               File: list-products.query.ts:55                    │
├─────────────────────────────────────────────────────────────────┤
│ ❌ NO ENTITIES                                                   │
│                                                                  │
│ • Handler invocation                                             │
│ • Handler implementation                                         │
│ • Service layer delegation                                       │
│                                                                  │
│ Data Type: Query Parameters (Plain Objects)                      │
└──────────────────────────────┬──────────────────────────────────┘
                                 │ Service Method Call
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│            PHASE 4: DOMAIN SERVICE LAYER                         │
│            File: product-management.service.ts:89                │
├─────────────────────────────────────────────────────────────────┤
│ ❌ NO ENTITIES (yet)                                             │
│                                                                  │
│ • Service method execution                                       │
│ • Repository query strategy selection                            │
│                                                                  │
│ Data Type: Repository Method Parameters                          │
└──────────────────────────────┬──────────────────────────────────┘
                                 │ Repository Call
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│     PHASE 5A: PERSISTENCE LAYER (Repository - Query)             │
│          File: product.repository.impl.ts:192                    │
├─────────────────────────────────────────────────────────────────┤
│ ❌ NO ENTITIES (yet)                                             │
│                                                                  │
│ • ORM query construction                                         │
│ • Database query execution                                       │
│                                                                  │
│ Data Type: Prisma Query Objects & SQL                            │
└──────────────────────────────┬──────────────────────────────────┘
                                 │ SQL Query
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL/MySQL)                   │
├─────────────────────────────────────────────────────────────────┤
│ ❌ NO ENTITIES                                                   │
│                                                                  │
│ • Query parsing & optimization                                   │
│ • Index usage & data retrieval                                   │
│ • Result set formation                                           │
│                                                                  │
│ Data Type: Raw Database Records                                  │
└──────────────────────────────┬──────────────────────────────────┘
                                 │ Database Rows
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│     PHASE 5B: PERSISTENCE LAYER (Repository - Hydration)         │
│          File: product.repository.impl.ts:220                    │
├─────────────────────────────────────────────────────────────────┤
│ ✅ ENTITIES CREATED HERE!                                        │
│                                                                  │
│ • Entity hydration/reconstitution                                │
│ • Value object creation (ProductId, Slug)                       │
│ • Factory method invocation                                      │
│                                                                  │
│ Data Type: Product[] (Array of Domain Entities)                  │
└──────────────────────────────┬──────────────────────────────────┘
                                 │ Product[] Entities
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│         PHASE 6: DOMAIN SERVICE LAYER (Return)                   │
│            File: product-management.service.ts:170               │
├─────────────────────────────────────────────────────────────────┤
│ ✅ ENTITIES USED HERE                                            │
│                                                                  │
│ • Service receives entities                                      │
│ • Business logic could be applied                                │
│ • Entity wrapping in result object                               │
│                                                                  │
│ Data Type: { items: Product[], totalCount: number }              │
└──────────────────────────────┬──────────────────────────────────┘
                                 │ Product[] Entities
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│   PHASE 7: APPLICATION LAYER (Handler - Entity to DTO Mapping)   │
│               File: list-products.query.ts:73                    │
├─────────────────────────────────────────────────────────────────┤
│ ✅ ENTITIES USED HERE (Transformed to DTOs)                      │
│                                                                  │
│ • Entity mapping to DTOs                                         │
│ • Entity getter method calls                                     │
│ • Value object to primitive conversion                           │
│ • Result wrapping                                                │
│                                                                  │
│ Data Type: CommandResult<ListProductsResult>                     │
└──────────────────────────────┬──────────────────────────────────┘
                                 │ CommandResult with DTOs
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│        PHASE 8: PRESENTATION LAYER (Controller Response)         │
│              File: product.controller.ts:140                     │
├─────────────────────────────────────────────────────────────────┤
│ ❌ NO ENTITIES - Only DTOs                                       │
│                                                                  │
│ • Response formatting                                            │
│ • JSON serialization                                             │
│ • HTTP response transmission                                     │
│                                                                  │
│ Data Type: HTTP Response with JSON                               │
└──────────────────────────────┬──────────────────────────────────┘
                                 │ HTTP Response
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser/Mobile App)                   │
│              Receives JSON Response with Product Data            │
└─────────────────────────────────────────────────────────────────┘
```

---

## INDUSTRY TERMINOLOGY GLOSSARY

### Architectural Patterns

| Term                           | Definition                                                            | Example in Codebase                                  |
| ------------------------------ | --------------------------------------------------------------------- | ---------------------------------------------------- |
| **Domain-Driven Design (DDD)** | Approach structuring software around business domain concepts         | Domain layer with Product, Category entities         |
| **Layered Architecture**       | Organizing code into horizontal layers with specific responsibilities | Presentation → Application → Domain → Infrastructure |
| **CQRS**                       | Separating read operations (queries) from write operations (commands) | ListProductsQuery vs CreateProductCommand            |
| **Repository Pattern**         | Abstraction for data access that mimics a collection                  | IProductRepository interface                         |
| **Dependency Injection**       | Providing dependencies through constructors                           | constructor(private readonly repository)             |
| **Factory Pattern**            | Using methods to create objects instead of constructors               | Product.fromDatabaseRow()                            |

### Domain-Driven Design Concepts

| Term               | Definition                                                   | Example in Codebase                 |
| ------------------ | ------------------------------------------------------------ | ----------------------------------- |
| **Entity**         | Object with unique identity and business behavior            | Product class with ProductId        |
| **Value Object**   | Immutable object representing a concept with no identity     | ProductId, Slug, CategoryId         |
| **Aggregate**      | Cluster of entities and value objects treated as single unit | Product with its ProductId and Slug |
| **Domain Service** | Business logic that doesn't belong in an entity              | ProductManagementService            |
| **Repository**     | Interface for accessing aggregates                           | IProductRepository                  |

### TypeScript/JavaScript Concepts

| Term              | Definition                                  | Example in Codebase                      |
| ----------------- | ------------------------------------------- | ---------------------------------------- |
| **Interface**     | Contract defining structure of an object    | interface IProductRepository             |
| **Generic Type**  | Type that works with multiple types         | Promise<Product[]>, CommandResult<T>     |
| **Union Type**    | Value that can be one of several types      | "draft" \| "published" \| "scheduled"    |
| **Async/Await**   | Syntax for handling asynchronous operations | async handle() { await repo.findById() } |
| **Destructuring** | Extracting values from objects/arrays       | const { page, limit } = request.query    |

### Database Concepts

| Term              | Definition                                      | Example in Codebase               |
| ----------------- | ----------------------------------------------- | --------------------------------- |
| **ORM**           | Mapping between objects and database tables     | Prisma                            |
| **Query Builder** | API for constructing database queries           | Prisma's findMany({ where: ... }) |
| **Foreign Key**   | Column referencing primary key of another table | product_id in product_categories  |
| **Join**          | Combining rows from multiple tables             | categories: { some: {...} }       |
| **Pagination**    | Dividing results into pages                     | LIMIT and OFFSET clauses          |

### HTTP/API Concepts

| Term              | Definition                                       | Example in Codebase          |
| ----------------- | ------------------------------------------------ | ---------------------------- |
| **REST**          | Architectural style for web APIs                 | HTTP endpoints               |
| **Endpoint**      | URL that handles specific functionality          | GET /api/v1/catalog/products |
| **Status Code**   | Numeric code indicating request result           | 200 OK, 404 Not Found        |
| **Serialization** | Converting objects to transmittable format       | Object → JSON string         |
| **Middleware**    | Functions that execute during request processing | CORS, Rate Limiting          |

---

## ENTITY LIFECYCLE TRACKING

### When Are Entities Used?

✅ **Created**:

- **Phase 5B** - Persistence Layer (Repository): product.repository.impl.ts:220
- **Method**: Product.fromDatabaseRow()
- **Trigger**: Database rows returned from SQL query

✅ **Returned**:

- **Phase 5B → Phase 6** - Repository returns to Service
- **Return Type**: Promise<Product[]>

✅ **Used for Business Logic** (Potential):

- **Phase 6** - Domain Service Layer
- **Available Methods**: publish(), isDraft(), updateTitle(), etc.
- **Current Implementation**: Just passes them through

✅ **Transformed**:

- **Phase 7** - Application Layer (Handler)
- **File**: list-products.query.ts:73
- **Action**: Entity → DTO mapping using getter methods

❌ **NOT Used**:

- **Phase 0-1**: Bootstrap and HTTP processing (uses HTTP objects)
- **Phase 2**: Controller initial processing (uses DTOs)
- **Phase 3**: Handler initial invocation (uses query DTOs)
- **Phase 4**: Service initial call (uses plain parameters)
- **Phase 8**: Controller response (uses DTOs)
- **Client**: Receives JSON, not entities

---

This comprehensive guide covers the complete request lifecycle from HTTP route registration through every architectural layer, with extensive industry terminology explanations and real code examples from your Modett e-commerce platform!
