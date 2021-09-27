import type { ListenerOptions, PieceContext } from "@sapphire/framework";
import { Events, Listener, Command } from "@sapphire/framework";
import type { Message } from "discord.js";
import { env } from "../../lib/config";
import { commandLogger } from "../../lib/logger";

//TODO: Might want to consider runninng only on CommandSuccess, but for now this will fire on everything
export class UserEvent extends Listener<typeof Events.CommandRun> {
  public constructor(context: PieceContext, options?: ListenerOptions) {
    super(context, {
      ...options,
      event: Events.CommandRun,
    });
  }

  // Fires on every command ran by a user
  public run(message: Message, command: Command) {
    commandLogger.info(message.content, {
      shard: (message.guild?.shardId ?? 0).toString(),
      name: command.name,
      author: `${message.author.username}#${message.author.id}`,
      sentAt: message.guild
        ? `${message.guild.name}[${message.guild.id}]`
        : "Direct Messages",
    });
  }

  // Only enable if logCommands is true or we are in a dev enviornment
  public onLoad() {
    this.enabled = env.logCommands || env.development;
    return super.onLoad();
  }
}