import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions,
} from "@sapphire/framework";
import { fetch, FetchResultTypes } from "@sapphire/fetch";
import { ApplyOptions } from "@sapphire/decorators";
import { TENOR_URL } from "../../lib/constants";
import { config } from "../../lib/config";

@ApplyOptions<CommandOptions>(
  config.applyConfig("gif", {
    description: "Random gif getter, use at your own risk",
  }),
)
export default class GifCommand extends Command {
  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ) {
    registry.registerChatInputCommand((builder) => {
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((option) =>
          option
            .setName("term")
            .setDescription("Gif search term")
            .setRequired(false),
        );
    });
  }

  public override async chatInputRun(
    interaction: Command.ChatInputInteraction,
  ) {
    let search = interaction.options.getString("term", false);

    if (!search) {
      const terms: string[] = config.json.commands.gif.vars.search;
      search = terms[Math.floor(Math.random() * terms.length)];
    }

    try {
      TENOR_URL.search = new URLSearchParams(
        Object.entries({
          key: config.env.tenorToken,
          q: search,
          locale: "en_US",
          contentfilter: config.json.commands.gif.vars.contentfilter,
          media_filter: "minimal",
          limit: 1,
          ar_range: "standard",
        }),
      ).toString();

      const res = await fetch(TENOR_URL, FetchResultTypes.Text);

      if (res) {
        const json = JSON.parse(res);
        if (!json.results[0] || json.results[0].url.length == 0) {
          return interaction.reply("Unable to find gifs by that search term.");
        }

        return interaction.reply(json.results[0].url);
      }
    } catch (e) {
      return interaction.reply({
        ephemeral: true,
        content: "Something went wrong, try again later",
      });
    }
  }
}
