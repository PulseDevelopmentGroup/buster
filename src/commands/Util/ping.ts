import { ApplyOptions } from "@sapphire/decorators";
import { isMessageInstance } from "@sapphire/discord.js-utilities";
import {
  type ApplicationCommandRegistry,
  Command,
  type CommandOptions,
} from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import type { ChatInputCommandInteraction, Message } from "discord.js";
import { registerSlash } from "../../lib/registry";

@ApplyOptions<CommandOptions>({
  description: "ping pong",
})
export class PingCommand extends Command {
  public override async messageRun(message: Message) {
    const msg = await send(message, "Ping?");

    const content = `Pong! Bot Latency ${Math.round(
      this.container.client.ws.ping,
    )}ms. API Latency ${
      (msg.editedTimestamp || msg.createdTimestamp) - message.createdTimestamp
    }ms.`;

    return send(message, content);
  }

  public override async chatInputRun(interaction: ChatInputCommandInteraction) {
    await interaction.reply({
      content: "Ping?",
      flags: ["Ephemeral"],
    });

    const msg = await interaction.fetchReply().catch(() => null);
    if (msg && isMessageInstance(msg)) {
      const content = `Pong! Bot Latency ${Math.round(
        this.container.client.ws.ping,
      )}ms. API Latency ${
        (msg.editedTimestamp || msg.createdTimestamp) -
        interaction.createdTimestamp
      }ms.`;

      return interaction.editReply({ content });
    }
    return interaction.editReply({ content: "Failed to retrieve ping :(" });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ) {
    registerSlash(registry, (b) => {
      b.setName(this.name).setDescription(this.description);
      return b;
    });
  }
}
