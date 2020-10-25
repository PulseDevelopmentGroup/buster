import { Command, CommandoMessage } from "discord.js-commando";
import { config, getConfig } from "../../config";

export default class DebugCommand extends Command {
  constructor(client: any) {
    super(client, {
      name: "botctl",
      group: "utils",
      memberName: "botctl",
      description: "cOnTrOl ThE bOt",
      aliases: ["ctl", "debug"],
      guildOnly: true,
      ownerOnly: true,
      args: [
        {
          key: "action",
          prompt: "what admin tool should be used?",
          type: "string",
          error: "that doesn't appear to be a valid tool.",
          oneOf: ["config", "reload"],
        },
      ],
    });
  }
  async run(msg: CommandoMessage, { action }: { action: "reload" | "config" }) {
    switch (action) {
      case "reload":
        getConfig()
          .catch((e) => {
            return msg.say(
              `There was a problem reloading the bot's config: \`${e}\``
            );
          })
          .then(() => {
            return msg.say("Config reloaded!");
          });
        break;
      case "config":
        return msg.say(`\`\`\`json\n${JSON.stringify(config, null, 2)}\`\`\``);
      default:
        return msg.say("tHe CoDe MoNkEyS bRoKe It");
    }

    return null;
  }
}
