import { ApplyOptions } from "@sapphire/decorators";
import { FetchResultTypes, fetch } from "@sapphire/fetch";
import {
  type ApplicationCommandRegistry,
  type Args,
  Command,
  type CommandOptions,
} from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import type { ChatInputCommandInteraction, Message } from "discord.js";
import { config } from "../../lib/config";
import { TENOR_URL } from "../../lib/constants";
import { registerSlash } from "../../lib/registry";

@ApplyOptions<CommandOptions>(
  config.applyConfig("gif", {
    description: "Random gif getter, use at your own risk",
  }),
)
export default class GifCommand extends Command {
  override async messageRun(msg: Message, args: Args) {
    const query = args.next();
    const gifConfig = config.json.commands.gif;
    const url = await fetchGifUrl(
      query,
      gifConfig?.vars?.search as string[] | undefined,
    );
    if (!url) return send(msg, "Unable to find gifs by that search term.");
    return send(msg, url);
  }

  public override async chatInputRun(interaction: ChatInputCommandInteraction) {
    const query = interaction.options.getString("query") ?? undefined;
    const gifConfig = config.json.commands.gif;

    await interaction.deferReply();

    const url = await fetchGifUrl(
      query,
      gifConfig?.vars?.search as string[] | undefined,
    );
    if (!url)
      return interaction.editReply("Unable to find gifs by that search term.");

    return interaction.editReply({ content: url });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ) {
    registerSlash(registry, (b) => {
      b.setName(this.name)
        .setDescription(this.description)
        .addStringOption((o) =>
          o.setName("query").setDescription("Search term").setRequired(false),
        );
      return b;
    });
  }
}

async function fetchGifUrl(
  query: string | undefined,
  defaults?: string[],
): Promise<Promise<string | undefined>> {
  let search = query ?? "";
  const gifConfig = config.json.commands.gif;
  if (!search) {
    const terms =
      defaults ?? (gifConfig?.vars?.search as string[] | undefined) ?? [];
    if (terms.length > 0)
      search = terms[Math.floor(Math.random() * terms.length)] ?? "";
  }

  if (!search) return undefined;

  TENOR_URL.search = new URLSearchParams({
    key: config.env.tenorToken || "",
    q: search,
    locale: "en_US",
    contentfilter: (gifConfig?.vars?.contentfilter as string) || "off",
    media_filter: "minimal",
    limit: "1",
    ar_range: "standard",
  }).toString();

  const res = await fetch(TENOR_URL, FetchResultTypes.Text);
  if (!res) return undefined;
  const json = JSON.parse(res);
  return json.results?.[0]?.url?.length
    ? (json.results[0].url as string)
    : undefined;
}
