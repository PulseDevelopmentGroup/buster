import { applyConfig } from "../../lib/config";
import { Message, MessageEmbed } from "discord.js";
import { INSPIRE_URL } from "../../lib/constants";
import got from "got";
import { ApplyOptions } from "@sapphire/decorators";
import { Command, CommandOptions } from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";

@ApplyOptions<CommandOptions>(
  applyConfig("inspire", {
    description:
      "Images generated by AI... how could things possibly go wrong?",
    preconditions: ["GuildOnly"],
  }),
)
export class InspireCommand extends Command {
  async run(msg: Message) {
    const { body } = await got.get(INSPIRE_URL, {
      searchParams: { generate: true },
    });

    if (body) {
      return send(msg, {
        embeds: [
          new MessageEmbed()
            .setURL("https://inspirobot.me")
            .setImage(body)
            .setColor("#6dd3ff"),
        ],
      });
    }

    return send(msg, "It seems something went wrong, try again later?");
  }
}
