import { Command } from "@sapphire/framework";
import type { Message } from "discord.js";
import { env } from "../../lib/config";

export class UserCommand extends Command {
  public async run(message: Message) {
    message.channel.send(JSON.stringify(env));
  }
}
