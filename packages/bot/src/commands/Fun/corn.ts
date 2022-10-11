import { ApplyOptions } from "@sapphire/decorators";
import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import { config } from "../../lib/config";

@ApplyOptions(
  config.applyConfig("corn", {
    description: "🌽",
  }),
)
export default class CornCommand extends Command {
  private corns = [
    config.json.commands.corn.vars.cornCornURL,
    config.json.commands.corn.vars.cubeURL,
    config.json.commands.corn.vars.cornURL,
  ];

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ) {
    registry.registerChatInputCommand((builder) => {
      builder.setName(this.name).setDescription(this.description); // TODO: Add option to specify corn with complete functionality
    });
  }

  public override async chatInputRun(
    interaction: Command.ChatInputInteraction,
  ) {
    interaction.reply(`${this.corns[Math.floor(Math.random() * 3)]}`);
  }
}
