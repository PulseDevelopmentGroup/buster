import { ApplyOptions } from "@sapphire/decorators";
import { type Args, Command, type CommandOptions } from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import { EmbedBuilder, type Message } from "discord.js";
import { google } from "googleapis";
import { config } from "../../lib/config";
import { PERSPECTIVE_URL } from "../../lib/constants";
import { IntentAttributeNameLookup } from "../../lib/models";

@ApplyOptions<CommandOptions>(
  config.applyConfig("intent", {
    name: "intent",
    description: "Figure out what the _actual_ intent of a message is",
    preconditions: ["GuildOnly"],
  }),
)
export default class IntentCommand extends Command {
  public override async messageRun(msg: Message, args: Args) {
    let targetMessage = (await args.pickResult("message")).unwrapOr(undefined);
    const client = await google.discoverAPI(PERSPECTIVE_URL.toString());

    if (!targetMessage) {
      // biome-ignore lint/suspicious/noSparseArray: Just getting things working for now
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

    // biome-ignore lint/suspicious/noExplicitAny: Just getting things working for now
    const res: any = await new Promise((resolve, reject) =>
      // biome-ignore lint/suspicious/noExplicitAny: Just getting things working for now
      (client.comments as any).analyze(
        {
          key: config.env.perspectiveApiKey,
          resource: req,
        },
        // biome-ignore lint/suspicious/noExplicitAny: Just getting things working for now
        (err: Error, response: any) => {
          if (err) {
            reject(err);
          }

          resolve(response);
        },
      ),
    );

    if (res.status === 200) {
      const embed = new EmbedBuilder()
        .setTitle("Intent Summary")
        .setColor("#f5b342")
        .setDescription(`Intent Analysis for \`${targetMessage.content}\``);

      const { attributeScores } = res.data;

      Object.entries(attributeScores)
        .sort(([ka], [kb]) => (ka > kb ? 1 : kb > ka ? -1 : 0))
        // biome-ignore lint/suspicious/noExplicitAny: Just getting things working for now
        .forEach(([attribute, scoreSummary]: [string, any]) => {
          // This is jank and I take no responsibility

          const name: string =
            IntentAttributeNameLookup[
              attribute as keyof typeof IntentAttributeNameLookup
            ];

          const percent = Math.floor(
            scoreSummary.spanScores[0].score.value * 100,
          );

          embed.addFields({ name, value: `${percent}%` });
        });

      return send(msg, {
        embeds: [embed],
      });
    }

    return send(msg, "you see nothing...");
  }
}
