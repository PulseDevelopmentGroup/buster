import { ApplyOptions } from "@sapphire/decorators";
import { type Args, Command, type CommandOptions } from "@sapphire/framework";
import { EmbedBuilder, type Message } from "discord.js";
import { EMBED_COLOR } from "../../lib/constants";

@ApplyOptions<CommandOptions>({
  name: "help",
  description: "get bot help command",
  requiredClientPermissions: ["SendMessages", "EmbedLinks"],
})

// Code influenced by https://github.com/NezuChan/kamado-tanjiro
export class clientCommand extends Command {
  public override async messageRun(message: Message, args: Args) {
    const userArgument = await await args.restResult("string");
    if (userArgument.isOk()) {
      const command = this.container.stores
        .get("commands")
        .get(userArgument.unwrap());
      if (!command) return;
      const embed = new EmbedBuilder()
        .addFields([
          {
            name: "Description",
            value: `${command.description ? command.description : "No description"}`,
          },
          {
            name: "Detailed Description",
            value: `${
              command.detailedDescription
                ? command.detailedDescription
                : "No detailed description"
            }`,
          },
          {
            name: "Aliases",
            value:
              command.aliases.length > 1
                ? `\`${command.aliases.join("` `")}\``
                : "No aliases",
            inline: true,
          },
        ])
        .setColor(EMBED_COLOR);
      if (message.channel.isSendable()) {
        return message.channel.send({ embeds: [embed] });
      }
    }

    const categories = [
      ...new Set(
        this.container.stores
          .get("commands")
          .map((x) => x.fullCategory[x.fullCategory.length - 1]),
      ),
    ];
    const embed = new EmbedBuilder()
      .setAuthor({
        name: `❯ ${this.container.client.user?.username} command(s) list`,
        iconURL: this.container.client.user?.displayAvatarURL(),
      })
      .setDescription("A list of available commands.")
      .setColor(EMBED_COLOR);
    const fields = [];
    for (const category of categories) {
      const commands = this.container.stores
        .get("commands")
        .filter((x) => x.category === category);
      fields.push({
        name: `${category as string}`,
        value: commands.map((x) => `\`${x.name}\``).join(", "),
        inline: false,
      });
    }
    embed.addFields(fields);
    if (message.channel.isSendable()) {
      return message.channel.send({ embeds: [embed] });
    }
    return undefined;
  }
}
