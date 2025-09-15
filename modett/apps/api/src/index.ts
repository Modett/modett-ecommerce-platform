import { config } from "dotenv";
import { createServer } from "./server";
import pino from "pino";

// Inline logger for startup
const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    },
  },
});

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
