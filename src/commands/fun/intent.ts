import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { env, setupCommand } from "../../config";
import { google } from "googleapis";
import { PERSPECTIVE_URL } from "../../constants";
import { Message, MessageEmbed } from "discord.js";
import { IntentAttributeNameLookup } from "../../models";

export default class IntentCommand extends Command {
  constructor(client: CommandoClient) {
    super(
      client,
      setupCommand({
        name: "intent",
        group: "fun",
        memberName: "intent",
        description: "Figure out what the _actual_ intent of a message is",
        guildOnly: true,
        args: [
          {
            key: "messageId",
            prompt: "What message should I figure out the intent for?",
            type: "string",
            error: "Hmm... I'm not seeing a message with that id :(",
            default: "",
          },
        ],
      })
    );
  }

  async run(msg: CommandoMessage, { messageId }: { messageId: string }) {
    const client = await google.discoverAPI(PERSPECTIVE_URL);

    let targetMessage: Message | undefined;

    if (messageId) {
      const specifiedMessage = await msg.channel.messages.fetch(messageId);

      if (specifiedMessage?.content) {
        targetMessage = specifiedMessage;
      }
    }

    if (!targetMessage) {
      if (msg.channel.messages.cache.size === 0) {
        await msg.channel.messages.fetch();
      }
      const channelMessages = msg.channel.messages.cache
        .sort((a, b) => (a.createdTimestamp = b.createdTimestamp))
        .array();

      [targetMessage] = channelMessages.slice(-2, -1);
    }

    if (!targetMessage?.content) {
      return msg.say("Sorry, I couldn't figure out how to analyze that :/");
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

    const res: any = await new Promise((resolve, reject) =>
      (client.comments as any).analyze(
        {
          key: env.perspectiveApiKey,
          resource: req,
        },
        (err: Error, response: any) => {
          if (err) {
            reject(err);
          }

          resolve(response);
        }
      )
    );

    if (res.status === 200) {
      const embed = new MessageEmbed()
        .setTitle("Intent Summary")
        .setColor("#f5b342")
        .setDescription(`Intent Analysis for \`${targetMessage.content}\``);

      const { attributeScores } = res.data;

      Object.entries(attributeScores)
        .sort(([ka], [kb]) => (ka > kb ? 1 : kb > ka ? -1 : 0))
        .forEach(([attribute, scoreSummary]: [string, any]) => {
          // This is jank and I take no responsibility

          const name: string =
            IntentAttributeNameLookup[
              attribute as keyof typeof IntentAttributeNameLookup
            ];

          const percent = Math.floor(
            scoreSummary.spanScores[0].score.value * 100
          );

          embed.addField(name, `${percent}%`);
        });

      return msg.embed(embed);
    }

    return msg.say("you see nothing...");
  }
}
