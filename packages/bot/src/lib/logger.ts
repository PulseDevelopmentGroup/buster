import winston from "winston";
import { config } from "./config";

export class BotLogger {
  // prettyFormat is the log formatter used when in a development scenario
  private prettyFormat: winston.Logform.Format = winston.format.simple();

  // Default logging options, primarily handling logic depending on the environment
  private defaultOptions: winston.LoggerOptions = {};

  // Used for general bot event logging
  public bot = winston.createLogger();

  // Used for command logging
  public command = winston.createLogger();

  // TODO: Message logger for export to Loki/Elastic/Other

  public constructor(debug: boolean) {
    this.prettyFormat = winston.format.combine(
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

    this.defaultOptions = {
      level: debug ? "debug" : "info",
      format: debug
        ? this.prettyFormat
        : winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
      transports: [new winston.transports.Console()],
    };

    this.bot.configure(
      this.apply({
        defaultMeta: { service: "bot" },
      }),
    );

    this.command.configure(
      this.apply({
        defaultMeta: { service: "command" },
      }),
    );
  }

  // Works much in the same way as applyConfig, just applies options for the logger
  private apply(opts?: winston.LoggerOptions): winston.LoggerOptions {
    return {
      ...opts,
      ...this.defaultOptions,
    };
  }
}

// Creating an instance of logger here to be accessed globally
export const logger = new BotLogger(config.env.development);
