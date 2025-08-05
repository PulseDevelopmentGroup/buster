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
  override async messageRun(msg: Message, args: Args) {
    const type = args.next();
    const cornConfig = config.json.commands.corn;

    if (!cornConfig) {
      return send(msg, "Corn command configuration not found");
    }

    if (type) {
      switch (type.toLowerCase()) {
        case "corn":
          return send(msg, cornConfig.vars.cornCornURL as string);
        case "cube":
          return send(msg, cornConfig.vars.cubeURL as string);
      }
    }

    return send(msg, cornConfig.vars.cornURL as string);
  }
}
