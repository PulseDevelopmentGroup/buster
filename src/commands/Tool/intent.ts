import { ApplyOptions } from "@sapphire/decorators";
import {
  type ApplicationCommandRegistry,
  type Args,
  Command,
  type CommandOptions,
} from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  type Message,
} from "discord.js";
import { google } from "googleapis";
import { config } from "../../lib/config";
import { PERSPECTIVE_URL } from "../../lib/constants";
import { registerSlash } from "../../lib/registry";

const intentAttributeNames = {
  toxicity: ":skull: Toxicity",
  severeToxicity: ":skull_crossbones: Severe Toxicity",
  identityAttack: ":point_right: Identity Attack",
  insult: ":cold_face: Insult",
  profanity: ":face_with_symbols_over_mouth: Profanity",
  threat: ":dagger: Threat",
  sexuallyExplicit: ":eggplant: Sexually Explicit",
  flirtation: ":kissing_heart: Flirtation",
};

type AttributeScores = Record<
  string,
  {
    spanScores: {
      begin: number;
      end: number;
      score: { value: number; type: string };
    }[];
    summaryScore?: { value: number; type: string };
  }
>;

interface AnalyzeResponse {
  status: number;
  data: { attributeScores: AttributeScores };
}

async function analyzeWithPerspective(
  client: unknown,
  resource: unknown,
): Promise<AnalyzeResponse> {
  interface PerspectiveClient {
    comments: {
      analyze: (
        args: { key?: string; resource: unknown },
        cb: (err: unknown, response: AnalyzeResponse) => void,
      ) => void;
    };
  }

  const pc = client as unknown as PerspectiveClient;
  return await new Promise<AnalyzeResponse>((resolve, reject) =>
    pc.comments.analyze(
      { key: config.env.perspectiveApiKey, resource },
      (err, response) => {
        if (err) return reject(err);
        resolve(response);
      },
    ),
  );
}

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

    const res = await analyzeWithPerspective(client, req);

    if (res.status === 200) {
      const embed = new EmbedBuilder()
        .setTitle("Intent Summary")
        .setColor("#f5b342")
        .setDescription(`Intent Analysis for \`${targetMessage.content}\``);

      const { attributeScores } = res.data;
      Object.entries(attributeScores as AttributeScores)
        .sort(([ka], [kb]) => (ka > kb ? 1 : kb > ka ? -1 : 0))
        .forEach(([attribute, scoreSummary]) => {
          // This is jank and I take no responsibility

          const name: string =
            intentAttributeNames[
              attribute as keyof typeof intentAttributeNames
            ];

          const first =
            (scoreSummary as AttributeScores[string])?.spanScores?.[0]?.score
              ?.value ?? 0;
          const percent = Math.floor(first * 100);

          embed.addFields({ name, value: `${percent}%` });
        });

      return send(msg, {
        embeds: [embed],
      });
    }

    return send(msg, "you see nothing...");
  }

  public override async chatInputRun(interaction: ChatInputCommandInteraction) {
    const text = interaction.options.getString("text") ?? undefined;
    const client = await google.discoverAPI(PERSPECTIVE_URL.toString());

    let content = text;
    if (!content) {
      const messages = await interaction.channel?.messages.fetch({
        before: interaction.id,
        limit: 1,
      });
      const [, last] = messages ? [...messages] : [];
      content = last?.[1]?.content;
    }
    if (!content)
      return interaction.reply({
        content: "No message to analyze.",
        flags: ["Ephemeral"],
      });

    const req = {
      comment: { text: content },
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
    } as const;

    const res = await analyzeWithPerspective(client, req);

    if (res.status === 200) {
      const embed = new EmbedBuilder()
        .setTitle("Intent Summary")
        .setColor("#f5b342")
        .setDescription(`Intent Analysis for \`${content}\``);
      const { attributeScores } = res.data;
      Object.entries(attributeScores as AttributeScores)
        .sort(([ka], [kb]) => (ka > kb ? 1 : kb > ka ? -1 : 0))
        .forEach(([attribute, scoreSummary]) => {
          const name: string =
            intentAttributeNames[
              attribute as keyof typeof intentAttributeNames
            ];
          const first =
            (scoreSummary as AttributeScores[string])?.spanScores?.[0]?.score
              ?.value ?? 0;
          const percent = Math.floor(first * 100);
          embed.addFields({ name, value: `${percent}%` });
        });
      return interaction.reply({ embeds: [embed] });
    }
    return interaction.reply("you see nothing...");
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ) {
    registerSlash(registry, (b) => {
      b.setName(this.name)
        .setDescription(this.description)
        .addStringOption((o) =>
          o
            .setName("text")
            .setDescription("Text to analyze")
            .setRequired(false),
        );
      return b;
    });
  }
}
