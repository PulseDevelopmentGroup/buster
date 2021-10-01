import type { CommandErrorPayload, Events } from "@sapphire/framework";
import { Listener } from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import { MessageEmbed } from "discord.js";

export class UserEvent extends Listener<typeof Events.CommandError> {
  public async run(e: Error, payload: CommandErrorPayload) {
    await payload.message.guild?.channels
      .fetch("893296394478182450")
      .then((channel) => {
        if (channel?.isText()) {
          const embed = new MessageEmbed({
            title: "Error Details",
          });
          embed.setColor("RED");

          embed.addField("Message", e.message);
          embed.addField("Error Type", e.name);

          if (e.stack) {
            embed.addField("Stack", `\`${e.stack}\``);
          }

          channel.send({
            embeds: [embed],
          });
        }
      });

    await send(payload.message, "Sorry, something went wrong :(");
  }
}
