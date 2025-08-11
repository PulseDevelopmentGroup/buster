import { type Command, Events, Listener } from "@sapphire/framework";
import type { Message } from "discord.js";
import { config } from "../../lib/config";
import { logger } from "../../lib/logger";

//TODO: Might want to consider runninng only on CommandSuccess, but for now this will fire on everything
export class CommandLoggerListener extends Listener<
  typeof Events.MessageCommandRun
> {
  public constructor(context: Listener.LoaderContext) {
    super(context, {
      event: Events.MessageCommandRun,
    });
  }

  // Fires on every command ran by a user
  public run(message: Message, command: Command) {
    logger.command.info(`"${message.content}"`, {
      shard: (message.guild?.shardId ?? 0).toString(),
      name: command.name,
      author: `${message.author.tag}`,
      sentAt: message.guild ? `${message.guild.name}` : "Direct Messages",
    });
  }

  // Only enable if logCommands is true or we are in a dev enviornment
  public override onLoad() {
    this.enabled = config.env.logCommands || config.env.development;
    return super.onLoad();
  }
}
