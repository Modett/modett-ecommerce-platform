import fastify, { FastifyInstance } from "fastify";
import { loggerConfig } from "./utils/logger";

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
