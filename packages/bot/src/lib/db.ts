import Redis, { RedisOptions } from "ioredis";
import Bull, { QueueOptions } from "bull";
import { config } from "./config";
import type { Reminder } from "./models";

export interface dbOpts {
  redis?: RedisOptions;
  bull?: {
    queueName?: string;
    prefix?: string;
  };
}

export class DB {
  public redis: Redis.Redis | undefined = undefined;
  public bull: Bull.Queue | undefined = undefined;

  public redisOptions: RedisOptions;
  public bullOptions: QueueOptions;

  public enabled = false;

  public constructor(opts: dbOpts) {
    if (opts.redis) {
      this.enabled = true;

      this.redisOptions = opts.redis;
      this.bullOptions = {
        prefix: opts.bull?.prefix ?? "buster",
        redis: opts.redis,
      };

      this.redis = new Redis(opts.redis);
      this.bull = new Bull(
        opts.bull?.queueName ?? "scheduled-tasks",
        this.bullOptions,
      );
    }
  }
}

/* Set up DB instance */
let redis: RedisOptions | undefined;
if (config.env.dbRedisHost) {
  redis = {
    host: config.env.dbRedisHost,
    port: config.env.dbRedisPort,
    db: config.env.dbRedisDB,
  };
}

export const db = new DB({ redis });
