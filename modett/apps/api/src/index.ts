import { config } from "dotenv";
import { createServer } from "./server";
import { logger } from "./utils/logger";

config();

const start = async () => {
  const server = await createServer();
  const port = Number(process.env.PORT) || 3000;
  const host = process.env.HOST || "localhost";

  await server.listen({ port, host });
  logger.info(`🚀 Server running at http://${host}:${port}`);
  logger.info(`📚 Swagger docs at http://${host}:${port}/docs`);
};

start().catch((error) => {
  logger.error(error);
  process.exit(1);
});
