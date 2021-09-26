import winston from "winston";
import { env } from "./config";

const prettyFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.colorize(),
  winston.format.printf(
    (info) =>
      `${info.timestamp} [${info.level}] ${JSON.stringify(
        info.message,
        null,
        4
      )}`
  )
);

const defaultOptions: winston.LoggerOptions = {
  level: env.development ? "debug" : "info",
  format: env.development
    ? prettyFormat
    : winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.Console()],
};

function applyOptions(opts?: winston.LoggerOptions): winston.LoggerOptions {
  return {
    ...opts,
    ...defaultOptions,
  };
}

export const logger = winston.createLogger(
  applyOptions({
    defaultMeta: { service: "bot-backend" },
  })
);

export const commandLogger = winston.createLogger(
  applyOptions({
    defaultMeta: { service: "bot-command" },
  })
);
