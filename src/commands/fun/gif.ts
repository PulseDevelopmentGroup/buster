import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import got from "got";
import { config, env } from "../../bot";

const tenorURL = "https://api.tenor.com/v1/random";

export default class GifCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "gif",
      group: "fun",
      memberName: "gif",
      aliases: ["gifs"],
      description: "Random gif getter, use at your own risk",
      guildOnly: true,

      args: [
        {
          key: "search",
          prompt: "Where should I look for a gif?",
          type: "string",
          error: "That doesn't seem to be a place.",
          default: "",
        },
      ],
    });
  }

  async run(msg: CommandoMessage, { search }: { search: string }) {
    if (!search) {
      let terms: string[] = config.commands["gif"]["search"];
      search = terms[Math.floor(Math.random() * terms.length)];
    }

    const { body } = await got.get(tenorURL, {
      searchParams: {
        key: env.tenorToken,
        q: search,
        locale: "en_US",
        contentfilter: config.commands["gif"]["contentfilter"],
        media_filter: "minimal",
        limit: 1,
        ar_range: "standard",
      },
    });

    if (body) {
      let json = JSON.parse(body);
      return msg.say(json.results[0].url);
    }

    return msg.say("It seems something went wrong, try again later?");
  }
}
