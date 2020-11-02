import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { setupCommand, config, env } from "../../config";
import got from "got";

const url = "https://api.tenor.com/v1/random";

export default class GifCommand extends Command {
  constructor(client: CommandoClient) {
    super(
      client,
      setupCommand({
        name: "gif",
        group: "fun",
        memberName: "gif",
        description: "Random gif getter, use at your own risk",
        guildOnly: true,
        args: [
          {
            key: "search",
            prompt: "where should I look for a gif?",
            type: "string",
            error: "that doesn't seem to be a place.",
            default: "",
          },
        ],
      })
    );
  }

  async run(msg: CommandoMessage, { search }: { search: string }) {
    if (!search) {
      let terms: string[] = config.commands.gif.vars.search;
      search = terms[Math.floor(Math.random() * terms.length)];
    }

    const { body } = await got.get(url, {
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
        return msg.say("I can't seem to find any gifs :(");
      }
      return msg.say(json.results[0].url);
    }

    return msg.say("It seems something went wrong, try again later?");
  }
}
