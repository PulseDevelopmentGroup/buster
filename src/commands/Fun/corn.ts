import { ApplyOptions } from "@sapphire/decorators";
import { type Args, Command, type CommandOptions } from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import type { Message } from "discord.js";
import { config } from "../../lib/config";

@ApplyOptions<CommandOptions>(
  config.applyConfig("corn", {
    description: "🌽",
  }),
)
export default class CornCommand extends Command {
  async messageRun(msg: Message, args: Args) {
    const type = args.next();

    if (type) {
      switch (type.toLowerCase()) {
        case "corn":
          return send(msg, config.json.commands.corn.vars.cornCornURL);
        case "cube":
          return send(msg, config.json.commands.corn.vars.cubeURL);
      }
    }

    return send(msg, config.json.commands.corn.vars.cornURL);
  }
}
