import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { config, setupCommand } from "../../config";

export default class CornCommand extends Command {
  constructor(client: CommandoClient) {
    super(
      client,
      setupCommand({
        name: "corn",
        memberName: "corn",
        group: "fun",
        description: "🌽",
        guildOnly: true,
        args: [
          {
            key: "type",
            prompt: "type of 🌽",
            type: "string",
            oneOf: ["corn", "cube"],
            error: "bad 🌽",
            default: "",
          },
        ],
      })
    );
  }

  async run(msg: CommandoMessage, { type }: { type: "corn" | "cube" }) {
    if (!type) {
      return msg.say(config.commands.corn.vars.cornURL);
    }

    switch (type) {
      case "corn":
        return msg.say(config.commands.corn.vars.cornCornURL);
      case "cube":
        return msg.say(config.commands.corn.vars.cubeURL);
    }
  }
}
