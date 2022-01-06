import type { CommandErrorPayload, Events } from "@sapphire/framework";
import { Listener } from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import { MessageEmbed } from "discord.js";

export class UserEvent extends Listener<typeof Events.CommandError> {
  public async run(e: Error, { message }: CommandErrorPayload) {
    await message.guild?.channels
      .fetch("893296394478182450")
      .then((channel) => {
        if (channel?.isText()) {
          const embed = new MessageEmbed({
            title: "Error Details",
          });
          embed.setColor("RED");

          embed.addField("Error Message", e.message, true);
          embed.addField("Error Type", e.name, true);

          if (message.member) {
            const pfp = message.member.user.avatarURL();

            if (pfp) {
              embed.setThumbnail(pfp);
            }

            embed.addField("Message Author", message.member?.user.username);
          }

          if (message.content) {
            embed.addField(
              "Message Content",
              message.content.substring(0, 1024),
            );
          }

          embed.setTimestamp(new Date());
          embed.setURL(message.url);
          embed.setFooter("Fields may be trimmed (<= 1024 characters)");

          if (e.stack) {
            embed.addField("Stack", `\`${e.stack.substring(0, 1019)}\``);
          }

          channel.send({
            embeds: [embed],
          });
        }
      });

    await send(message, "Sorry, something went wrong :(");
  }
}
