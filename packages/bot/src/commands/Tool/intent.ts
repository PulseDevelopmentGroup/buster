import { google } from "googleapis";
import { PERSPECTIVE_URL } from "../../lib/constants";
import { Message, MessageEmbed } from "discord.js";
import { IntentAttributeNameLookup } from "../../lib/models";
import { Args, Command, CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { send } from "@sapphire/plugin-editable-commands";
import { config } from "../../lib/config";

@ApplyOptions<CommandOptions>(
  config.applyConfig("intent", {
    name: "intent",
    description: "Figure out what the _actual_ intent of a message is",
    preconditions: ["GuildOnly"],
  }),
)
export default class IntentCommand extends Command {
  async messageRun(msg: Message, args: Args) {
    let targetMessage = (await args.pickResult("message")).unwrapOr(undefined);
    const client = await google.discoverAPI(PERSPECTIVE_URL.toString());

    if (!targetMessage) {
      // eslint-disable-next-line no-sparse-arrays
      [[, targetMessage] = [, undefined]] = await msg.channel.messages.fetch({
        before: msg.id,
        limit: 1,
      });
    }

    if (!targetMessage?.content) {
      return send(msg, "Sorry, I couldn't figure out how to analyze that :/");
    }

    const req = {
      comment: {
        text: targetMessage.content,
      },
      requestedAttributes: {
        TOXICITY: {},
        SEVERE_TOXICITY: {},
        IDENTITY_ATTACK: {},
        INSULT: {},
        PROFANITY: {},
        THREAT: {},
        SEXUALLY_EXPLICIT: {},
        FLIRTATION: {},
      },
      doNotStore: true,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await new Promise((resolve, reject) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (client.comments as any).analyze(
        {
          key: config.env.perspectiveApiKey,
          resource: req,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err: Error, response: any) => {
          if (err) {
            reject(err);
          }

          resolve(response);
        },
      ),
    );

    if (res.status === 200) {
      const embed = new MessageEmbed()
        .setTitle("Intent Summary")
        .setColor("#f5b342")
        .setDescription(`Intent Analysis for \`${targetMessage.content}\``);

      const { attributeScores } = res.data;

      Object.entries(attributeScores)
        .sort(([ka], [kb]) => (ka > kb ? 1 : kb > ka ? -1 : 0))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .forEach(([attribute, scoreSummary]: [string, any]) => {
          // This is jank and I take no responsibility

          const name: string =
            IntentAttributeNameLookup[
              attribute as keyof typeof IntentAttributeNameLookup
            ];

          const percent = Math.floor(
            scoreSummary.spanScores[0].score.value * 100,
          );

          embed.addField(name, `${percent}%`);
        });

      return send(msg, {
        embeds: [embed],
      });
    }

    return send(msg, "you see nothing...");
  }
}
