import { Args, Command, CommandOptions } from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import { fetch, FetchResultTypes } from "@sapphire/fetch";
import { ApplyOptions } from "@sapphire/decorators";
import type { Message } from "discord.js";
import { TENOR_URL } from "../../lib/constants";
import { config } from "../../lib/config";

@ApplyOptions<CommandOptions>(
  config.applyConfig("remind", {
    description: "Remind me.. or you... or someone else",
  }),
)
export default class RemindCommand extends Command {
  async messageRun(msg: Message, args: Args) {
    let search = args.nextMaybe().value;

    if (!search) {
      const terms: string[] = config.json.commands.gif.vars.search;
      search = terms[Math.floor(Math.random() * terms.length)];
    }

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
        return send(msg, "Unable to find gifs by that search term.");
      }

      return send(msg, json.results[0].url);
    }

    return send(msg, "Something went wrong, please try again later.");
  }
}
