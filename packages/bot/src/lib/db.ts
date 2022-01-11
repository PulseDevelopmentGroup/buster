import {
  Column,
  Connection,
  createConnection,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";
import { WinstonAdaptor } from "typeorm-logger-adaptor/logger/winston";
import { logger } from "./logger";
import { config } from "./config";

@Entity()
export class Reminder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: Date;

  @Column()
  user: string;

  @Column()
  channel: string;

  @Column()
  reminder: string;
}

export class BotDB {
  connection: Connection;

  reminders: Reminder[];

  public constructor(path: string, debug: boolean) {
    createConnection({
      type: "sqlite",
      database: path,
      logging: debug,
      logger: new WinstonAdaptor(logger.db, "all"),
      entities: [Reminder],
    }).then((connection) => (this.connection = connection));
  }

  public async getReminders(): Promise<Reminder[]> {
    return this.connection.getRepository(Reminder).find();
  }
}

// Creating an instance of BotDB here to be accessed globally
export const db = new BotDB(config.env.dataPath, config.env.development);
