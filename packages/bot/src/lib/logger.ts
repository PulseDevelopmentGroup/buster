import winston from "winston";
import { config } from "./config";

export class BotLogger {
  // Used for general bot event logging
  public bot = winston.createLogger();

  // Used for command logging
  public command = winston.createLogger();

  public db = winston.createLogger();

  // TODO: Message logger for export to Loki/Elastic/Other

  public constructor(debug: boolean) {
    const prettyFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.printf(
        ({ timestamp, level, service, message, ...rest }) => {
          const extraParams = Object.entries(rest)
            .map(([key, value]) => `${key}=${value}`)
            .join(" ");

          return `${timestamp} [${level}] [${service}] ${message} ${extraParams}`;
        },
      ),
    );

    const defaultOptions = {
      level: debug ? "debug" : "info",
      format: debug
        ? prettyFormat
        : winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
      transports: [new winston.transports.Console()],
    };

    this.bot.configure({
      ...defaultOptions,
      defaultMeta: { service: "bot" },
    });

    this.command.configure({
      ...defaultOptions,
      defaultMeta: { service: "command" },
    });

    this.db.configure({
      ...defaultOptions,
      defaultMeta: { service: "database" },
    });
  }
}

// Creating an instance of logger here to be accessed globally
export const logger = new BotLogger(config.env.development);
