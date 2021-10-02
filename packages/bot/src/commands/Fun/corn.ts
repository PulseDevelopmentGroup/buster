import { ApplyOptions } from "@sapphire/decorators";
import { Args, Command, CommandOptions } from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import type { Message } from "discord.js";
import { config } from "../../lib/config";

@ApplyOptions<CommandOptions>(
  config.applyConfig("corn", {
    description: "🌽",
  }),
)
export default class CornCommand extends Command {
  async run(msg: Message, args: Args) {
    const type = args.nextMaybe().value;

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
