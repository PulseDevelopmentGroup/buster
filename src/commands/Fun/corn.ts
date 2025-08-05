import { ApplyOptions } from "@sapphire/decorators";
import { Command, type CommandOptions } from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import type { Message } from "discord.js";
import { config } from "../../lib/config";

@ApplyOptions<CommandOptions>(
  config.applyConfig("corn", {
    description: "🌽",
  }),
)
export default class CornCommand extends Command {
  override async messageRun(msg: Message) {
    return send(
      msg,
      "https://media1.tenor.com/images/f2992828c6d4faeaced7aff0aa8d45ba/tenor.gif?itemid=19044521",
    );
  }
}
