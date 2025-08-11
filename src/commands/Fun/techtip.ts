import { faker } from "@faker-js/faker";
import { ApplyOptions } from "@sapphire/decorators";
import { type ApplicationCommandRegistry, Command } from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import type { ChatInputCommandInteraction, Message } from "discord.js";
import { config } from "../../lib/config";
import { registerSlash } from "../../lib/registry";

@ApplyOptions(
  config.applyConfig("techtip", {
    name: "techtip",
    description: "How to computer",
    preconditions: ["GuildOnly"],
  }),
)
export default class SupCommand extends Command {
  override async messageRun(msg: Message) {
    return send(msg, faker.hacker.phrase());
  }

  override async chatInputRun(interaction: ChatInputCommandInteraction) {
    return interaction.reply(faker.hacker.phrase());
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
