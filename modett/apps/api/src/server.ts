import fastify, { FastifyInstance } from "fastify";

// Inline logger configuration
const loggerConfig = {
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    },
  },
};

export async function createServer(): Promise<FastifyInstance> {
  const server = fastify({
    logger: loggerConfig,
    trustProxy: true,
  });

  // Register plugins
  await server.register(import("@fastify/cors"), {
    origin: true,
    credentials: true,
  });

  await server.register(import("@fastify/helmet"));

  await server.register(import("@fastify/rate-limit"), {
    max: 100,
    timeWindow: "1 minute",
  });

  await server.register(import("@fastify/swagger"), {
    swagger: {
      info: {
        title: "Modett E-commerce API",
        description: "Professional apparel e-commerce platform",
        version: "1.0.0",
      },
    },
  });

  await server.register(import("@fastify/swagger-ui"), {
    routePrefix: "/docs",
  });

  // Health check route
  server.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  return server;
}
