import { CommandOptions, Command, Args } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import { EMBED_COLOR } from "../../lib/constants";

@ApplyOptions<CommandOptions>({
  name: "help",
  description: "get bot help command",
  requiredClientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
})

// Code influenced by https://github.com/NezuChan/kamado-tanjiro
export class clientCommand extends Command {
  async messageRun(message: Message, args: Args) {
    const userArgument = await args.restResult("string");
    if (userArgument.success) {
      const command = this.container.stores
        .get("commands")
        .get(userArgument.value);
      if (!command) return;
      const embed = new MessageEmbed()
        .addField(
          "Description",
          `${command.description ? command.description : "No description"}`,
        )
        .addField(
          "Detailed Description",
          `${
            command.detailedDescription
              ? command.detailedDescription
              : "No detailed description"
          }`,
        )
        .addField(
          "Aliases",
          command.aliases.length > 1
            ? `\`${command.aliases.join("` `")}\``
            : "No aliases",
          true,
        )
        .setColor(EMBED_COLOR);
      return message.channel.send({ embeds: [embed] });
    }

    const categories = [
      ...new Set(
        this.container.stores
          .get("commands")
          .map((x) => x.fullCategory[x.fullCategory.length - 1]),
      ),
    ];
    const embed = new MessageEmbed()
      .setAuthor(
        `❯ ${this.container.client.user?.username} command(s) list`,
        this.container.client.user?.displayAvatarURL(),
      )
      .setDescription("A list of available commands.")
      .setColor(EMBED_COLOR);
    for (const category of categories) {
      const commands = this.container.stores
        .get("commands")
        .filter((x) => x.category === category);
      embed.fields.push({
        name: `${category as string}`,
        value: commands.map((x) => `\`${x.name}\``).join(", "),
        inline: false,
      });
    }
    return message.channel.send({ embeds: [embed] });
  }
}
