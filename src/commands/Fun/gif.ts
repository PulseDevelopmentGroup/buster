import { ApplyOptions } from "@sapphire/decorators";
import { FetchResultTypes, fetch } from "@sapphire/fetch";
import { type Args, Command, type CommandOptions } from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import type { Message } from "discord.js";
import { config } from "../../lib/config";
import { TENOR_URL } from "../../lib/constants";

@ApplyOptions<CommandOptions>(
  config.applyConfig("gif", {
    description: "Random gif getter, use at your own risk",
  }),
)
export default class GifCommand extends Command {
  override async messageRun(msg: Message, args: Args) {
    let search = args.next();
    const gifConfig = config.json.commands.gif;

    if (!gifConfig) {
      return send(msg, "GIF command configuration not found");
    }

    if (!search) {
      const terms = gifConfig.vars.search as string[];
      if (terms && terms.length > 0) {
        search = terms[Math.floor(Math.random() * terms.length)] ?? "";
      }
    }

    if (!search) {
      return send(
        msg,
        "No search term provided and no default terms configured",
      );
    }

    TENOR_URL.search = new URLSearchParams({
      key: config.env.tenorToken || "",
      q: search,
      locale: "en_US",
      contentfilter: (gifConfig.vars.contentfilter as string) || "off",
      media_filter: "minimal",
      limit: "1",
      ar_range: "standard",
    }).toString();

    const res = await fetch(TENOR_URL, FetchResultTypes.Text);

    if (res) {
      const json = JSON.parse(res);
      if (!json.results[0] || json.results[0].url.length === 0) {
        return send(msg, "Unable to find gifs by that search term.");
      }

      return send(msg, json.results[0].url);
    }

    return send(msg, "Something went wrong, please try again later.");
  }
}
