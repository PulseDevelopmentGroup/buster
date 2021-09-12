import { ApplyOptions } from "@sapphire/decorators";
import { Command, CommandOptions } from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import type { Message } from "discord.js";
import { setupCommand } from "../../config";

@ApplyOptions<CommandOptions>(
  setupCommand({
    name: "ping",
  })
)
export class PingCommand extends Command {
  public async run(message: Message) {
    const msg = await send(message, "Ping?");

    const content = `Pong! Bot Latency ${Math.round(
      this.container.client.ws.ping
    )}ms. API Latency ${
      (msg.editedTimestamp || msg.createdTimestamp) -
      (message.editedTimestamp || message.createdTimestamp)
    }ms.`;

    return send(message, content);
  }
}
