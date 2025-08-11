import { ApplyOptions } from "@sapphire/decorators";
import {
  type ApplicationCommandRegistry,
  type Args,
  Command,
  type CommandOptions,
} from "@sapphire/framework";
import {
  type AutocompleteInteraction,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  type Message,
} from "discord.js";
import { config } from "../../lib/config";
import { EMBED_COLOR } from "../../lib/constants";
import { registerSlash } from "../../lib/registry";

@ApplyOptions<CommandOptions>(
  config.applyConfig("help", {
    description: "Get bot help and command info",
    requiredClientPermissions: ["SendMessages", "EmbedLinks"],
  }),
)
export class clientCommand extends Command {
  private buildCommandEmbed(cmd: Command): EmbedBuilder {
    return new EmbedBuilder()
      .addFields([
        {
          name: "Description",
          value: cmd.description ? String(cmd.description) : "No description",
        },
        {
          name: "Detailed Description",
          value: cmd.detailedDescription
            ? String(cmd.detailedDescription)
            : "No detailed description",
        },
        {
          name: "Aliases",
          value:
            cmd.aliases && cmd.aliases.length > 0
              ? `\`${cmd.aliases.join("` `")}\``
              : "No aliases",
          inline: true,
        },
      ])
      .setColor(EMBED_COLOR);
  }

  private buildIndexEmbed(): EmbedBuilder {
    const commandsStore = this.container.stores.get("commands");
    const categories = [
      ...new Set(
        commandsStore.map((x) => x.fullCategory[x.fullCategory.length - 1]),
      ),
    ];

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `❯ ${this.container.client.user?.username} command(s) list`,
        ...(this.container.client.user && {
          iconURL: this.container.client.user.displayAvatarURL(),
        }),
      })
      .setDescription("A list of available commands.")
      .setColor(EMBED_COLOR);

    const fields: { name: string; value: string; inline: boolean }[] = [];
    for (const category of categories) {
      const cmds = commandsStore.filter((x) => x.category === category);
      fields.push({
        name: `${category as string}`,
        value: cmds.map((x) => `\`${x.name}\``).join(", ") || "None",
        inline: false,
      });
    }
    return embed.addFields(fields);
  }

  public override async messageRun(message: Message, args: Args) {
    const userArgument = await args.restResult("string");
    if (userArgument.isOk()) {
      const cmd = this.container.stores
        .get("commands")
        .get(userArgument.unwrap());
      if (!cmd) return;
      const embed = this.buildCommandEmbed(cmd);
      if (message.channel.isSendable()) {
        return message.channel.send({ embeds: [embed] });
      }
      return;
    }

    const embed = this.buildIndexEmbed();
    if (message.channel.isSendable()) {
      return message.channel.send({ embeds: [embed] });
    }
    return;
  }

  public override async chatInputRun(interaction: ChatInputCommandInteraction) {
    const userArgument = interaction.options.getString("command") ?? undefined;
    if (userArgument) {
      const cmd = this.container.stores.get("commands").get(userArgument);
      if (!cmd) {
        return interaction.reply({
          content: "Unknown command.",
          flags: ["Ephemeral"],
        });
      }
      const embed = this.buildCommandEmbed(cmd);
      return interaction.reply({ embeds: [embed], flags: ["Ephemeral"] });
    }

    const embed = this.buildIndexEmbed();
    return interaction.reply({ embeds: [embed], flags: ["Ephemeral"] });
  }

  public override async autocompleteRun(interaction: AutocompleteInteraction) {
    const focused = interaction.options.getFocused(true);
    const query = String(focused.value ?? "").toLowerCase();

    const commandsStore = this.container.stores.get("commands");
    type Choice = { name: string; value: string };
    const choices: Choice[] = [];

    for (const cmd of commandsStore.values()) {
      const name = cmd.name;
      if (!query || name.toLowerCase().includes(query)) {
        choices.push({ name, value: name });
      }
      if (cmd.aliases && cmd.aliases.length > 0) {
        for (const alias of cmd.aliases) {
          if (!query || alias.toLowerCase().includes(query)) {
            // Show alias, but resolve to the real command name
            choices.push({ name: `${alias} → ${name}`, value: name });
          }
        }
      }
    }

    // De-duplicate by value then name
    const unique = new Map<string, Choice>();
    for (const c of choices) {
      if (!unique.has(`${c.value}:${c.name}`))
        unique.set(`${c.value}:${c.name}`, c);
    }
    const results = Array.from(unique.values())
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 25);

    return interaction.respond(results);
  }
  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ) {
    registerSlash(registry, (b) => {
      b.setName(this.name)
        .setDescription(this.description)
        .addStringOption((o) =>
          o
            .setName("command")
            .setDescription("Command name to get help for")
            .setRequired(false)
            .setAutocomplete(true),
        );
      return b;
    });
  }
}
