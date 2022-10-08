import { ApplyOptions } from "@sapphire/decorators";
import { isMessageInstance } from "@sapphire/discord.js-utilities";
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions,
} from "@sapphire/framework";

@ApplyOptions<CommandOptions>({
  description: "ping pong",
})
export class UserCommand extends Command {
  public async chatInputRun(interaction: Command.ChatInputInteraction) {
    const msg = await interaction.reply({
      content: "Ping?",
      ephemeral: true,
      fetchReply: true,
    });

    if (isMessageInstance(msg)) {
      const content = `Pong! Bot Latency ${Math.round(
        this.container.client.ws.ping,
      )}ms. API Latency ${
        (msg.editedTimestamp || msg.createdTimestamp) -
        interaction.createdTimestamp
      }ms.`;

      return interaction.editReply(content);
    }
    return interaction.editReply("Failed to retrieve ping :(");
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ) {
    registry.registerChatInputCommand((builder) =>
      builder.setName(this.name).setDescription(this.description),
    );
  }
}
