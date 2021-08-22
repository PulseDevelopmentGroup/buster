import { MessageAttachment } from "discord.js";
import { Command, CommandoMessage } from "discord.js-commando";
import { config, getConfig, setupCommand } from "../../config";

export default class DebugCommand extends Command {
  constructor(client: any) {
    super(
      client,
      setupCommand({
        name: "debug",
        group: "dev",
        memberName: "debug",
        description: "cOnTrOl ThE bOt",
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
      })
    );
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
            this.client.registry.commands.forEach((c) => {
              if (this.name != c.name) c.reload();
            });

            return msg.say("Config reloaded!");
          });
        break;
      case "config":
        return msg.say(
          "",
          new MessageAttachment(
            Buffer.from(JSON.stringify(config)),
            "config.json"
          )
        );
      default:
        return msg.say("tHe CoDe MoNkEyS bRoKe It");
    }

    return null;
  }
}
