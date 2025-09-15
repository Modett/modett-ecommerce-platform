import pino from "pino";

// Logger configuration object for Fastify
export const loggerConfig = {
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

// Standalone logger instance for use outside of Fastify
export const logger = pino(loggerConfig);
