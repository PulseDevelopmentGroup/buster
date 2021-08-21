import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { env, setupCommand } from "../../config";
import { google } from "googleapis";
import { PERSPECTIVE_URL } from "../../constants";

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

    const req = {
      comment: {
        text: msg.content,
      },
      requestedAttributes: {
        TOXICITY: {},
      },
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

    console.log(res);

    if (res.status === 200) {
      return msg.say(JSON.stringify(res.data));
    }

    return msg.say("you see nothing...");
  }
}
