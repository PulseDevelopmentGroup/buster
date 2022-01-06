import got from "got-cjs";
import { Args, Command, CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import type { Message } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import { TENOR_URL } from "../../lib/constants";
import { config } from "../../lib/config";

@ApplyOptions<CommandOptions>(
  config.applyConfig("gif", {
    description: "Random gif getter, use at your own risk",
  }),
)
export default class GifCommand extends Command {
  async messageRun(msg: Message, args: Args) {
    let search = args.nextMaybe().value;

    if (!search) {
      const terms: string[] = config.json.commands.gif.vars.search;
      search = terms[Math.floor(Math.random() * terms.length)];
    }

    const { body } = await got.get(TENOR_URL, {
      searchParams: {
        key: config.env.tenorToken,
        q: search,
        locale: "en_US",
        contentfilter: config.json.commands.gif.vars.contentfilter,
        media_filter: "minimal",
        limit: 1,
        ar_range: "standard",
      },
    });

    if (body) {
      const json = JSON.parse(body);
      if (!json.results[0] || json.results[0].url.length == 0) {
        return send(msg, "Unable to find gifs by that search term.");
      }

      return send(msg, json.results[0].url);
    }

    return send(msg, "Something went wrong, please try again later.");
  }
}
