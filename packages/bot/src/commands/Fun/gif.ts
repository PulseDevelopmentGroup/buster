import got from "got";
import { Args, Command, CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import type { Message } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import { TENOR_URL } from "../../lib/constants";
import { PaginatedMessage } from "@sapphire/discord.js-utilities";
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
        limit: 5,
        ar_range: "standard",
      },
    });

    if (body) {
      const json = JSON.parse(body);
      if (!json.results[0]) {
        return send(msg, "I can't seem to find any gifs :(");
      }

      const paginatedMessage = new PaginatedMessage();

      (
        json.results as {
          // this is only a partial type
          url: string;
        }[]
      ).forEach((gif, i) => {
        paginatedMessage.addPageBuilder((builder) =>
          builder.setContent(`${i + 1} of ${json.results.length}
${gif.url}`),
        );
      });

      return await paginatedMessage.run(msg, msg.author);
    }

    return send(msg, "It seems something went wrong, try again later?");
  }
}
