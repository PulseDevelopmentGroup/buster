import winston from "winston";
import { env } from "./config";

// prettyFormat is the log formatter used when in a development scenario
const prettyFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.printf(
    (info) =>
      `${info.timestamp} [${info.level}] [${info.service}] ${info.message}`
  )
);

// Default logging options, primarily handling logic depending on the environment
const defaultOptions: winston.LoggerOptions = {
  level: env.development ? "debug" : "info",
  format: env.development
    ? prettyFormat
    : winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.Console()],
};

// Works much in the same way as applyConfig, just applies options for the logger
function applyOptions(opts?: winston.LoggerOptions): winston.LoggerOptions {
  return {
    ...opts,
    ...defaultOptions,
  };
}

// Used for general bot event logging
export const logger = winston.createLogger(
  applyOptions({
    defaultMeta: { service: "bot" },
  })
);

// Used for command logging
export const commandLogger = winston.createLogger(
  applyOptions({
    defaultMeta: { service: "command" },
  })
);

// TODO: Message logger for export to Loki/Elastic/Other
