import { config, env } from "../../lib/config";
import got from "got";
import { Args, Command, CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { applyConfig } from "../../lib/config";
import type { Message } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import { TENOR_URL } from "../../lib/constants";

@ApplyOptions<CommandOptions>(
  applyConfig("gif", {
    description: "Random gif getter, use at your own risk",
  })
)
export default class GifCommand extends Command {
  async run(
    msg: Message,
    args: Args
    // { search }: { search: string }
  ) {
    let search = args.nextMaybe().value;

    if (!search) {
      let terms: string[] = config.commands.gif.vars.search;
      search = terms[Math.floor(Math.random() * terms.length)];
    }

    const { body } = await got.get(TENOR_URL, {
      searchParams: {
        key: env.tenorToken,
        q: search,
        locale: "en_US",
        contentfilter: config.commands.gif.vars.contentfilter,
        media_filter: "minimal",
        limit: 1,
        ar_range: "standard",
      },
    });

    if (body) {
      let json = JSON.parse(body);
      if (!json.results[0]) {
        return send(msg, "I can't seem to find any gifs :(");
      }
      return send(msg, json.results[0].url);
    }

    return send(msg, "It seems something went wrong, try again later?");
  }
}
