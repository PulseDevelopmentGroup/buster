import type { Events, MessageCommandErrorPayload } from "@sapphire/framework";
import { Listener } from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import { EmbedBuilder } from "discord.js";

export class CommandErrorListener extends Listener<
  typeof Events.MessageCommandError
> {
  public async run(e: Error, { message }: MessageCommandErrorPayload) {
    await message.guild?.channels
      .fetch("893296394478182450")
      .then((channel) => {
        if (channel?.isSendable()) {
          const embed = new EmbedBuilder()
            .setTitle("Error Details")
            .setColor("Red");

          const fields = [
            { name: "Error Message", value: e.message, inline: true },
            { name: "Error Type", value: e.name, inline: true },
          ];

          if (message.member) {
            const pfp = message.member.user.avatarURL();

            if (pfp) {
              embed.setThumbnail(pfp);
            }

            fields.push({
              name: "Message Author",
              value: message.member?.user.username,
              inline: false,
            });
          }

          if (message.content) {
            fields.push({
              name: "Message Content",
              value: message.content.substring(0, 1024),
              inline: false,
            });
          }

          if (e.stack) {
            fields.push({
              name: "Stack",
              value: `\`${e.stack.substring(0, 1019)}\``,
              inline: false,
            });
          }

          embed.addFields(fields);
          embed.setTimestamp(new Date());
          embed.setURL(message.url);
          embed.setFooter({
            text: "Fields may be trimmed (<= 1024 characters)",
          });

          channel.send({
            embeds: [embed],
          });
        }
      });

    await send(message, "Sorry, something went wrong :(");
  }
}
