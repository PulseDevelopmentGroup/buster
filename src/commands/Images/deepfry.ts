import path from "node:path";
import { ApplyOptions } from "@sapphire/decorators";
import {
  type ApplicationCommandRegistry,
  type Args,
  Command,
  type CommandOptions,
} from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import {
  AttachmentBuilder,
  type ChatInputCommandInteraction,
  type Message,
} from "discord.js";
import gm from "gm";
import { Jimp } from "jimp";
import { config } from "../../lib/config";
import {
  type JimpImageLike,
  scaleImage,
  superimposeRandomly,
} from "../../lib/imageUtils";
import { registerSlash } from "../../lib/registry";
import {
  getRandomBool,
  getRandomInt,
  handleCommandError,
  parseImageInputFromInteraction,
  parseImageInputFromMessage,
} from "../../lib/utils";

// Using the standard Jimp instance with all built-in plugins

@ApplyOptions<CommandOptions>(
  config.applyConfig("fry", {
    description: "Deepfry your friends",
    preconditions: ["GuildOnly"],
  }),
)
export class DeepfryCommand extends Command {
  override async messageRun(msg: Message, args: Args) {
    const target = args.next();

    const parseResult = await parseImageInputFromMessage(msg, target);

    if (!parseResult.success) {
      return send(msg, parseResult.error);
    }

    try {
      // This will take a while, so indicate the bot is working on it
      if (msg.channel.isSendable()) {
        await msg.channel.sendTyping();
      }

      const out = await this.fryImage(parseResult.imageUrl);
      return send(msg, {
        files: [new AttachmentBuilder(out, { name: "fried.jpg" })],
      });
    } catch (e) {
      const errorMessage = handleCommandError({
        error: e,
        context: "deepfry command",
        userMessage: "Unable to fry the image.",
      });
      return send(msg, errorMessage);
    }
  }

  public override async chatInputRun(interaction: ChatInputCommandInteraction) {
    const parseResult = parseImageInputFromInteraction(interaction);

    if (!parseResult.success) {
      return interaction.reply({
        content: parseResult.error,
        flags: ["Ephemeral"],
      });
    }

    try {
      await interaction.deferReply();
      const out = await this.fryImage(parseResult.imageUrl);
      return interaction.editReply({
        files: [new AttachmentBuilder(out, { name: "fried.jpg" })],
      });
    } catch (e) {
      const errorMessage = handleCommandError({
        error: e,
        context: "deepfry slash command",
        userMessage: "Unable to fry the image.",
      });
      return interaction.editReply(errorMessage);
    }
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ) {
    registerSlash(registry, (b) => {
      b.setName(this.name)
        .setDescription(this.description)
        .addAttachmentOption((o) =>
          o.setName("image").setDescription("Image to fry").setRequired(false),
        )
        .addUserOption((o) =>
          o
            .setName("user")
            .setDescription("Use user's avatar")
            .setRequired(false),
        )
        .addStringOption((o) =>
          o.setName("input").setDescription("Image URL").setRequired(false),
        );
      return b;
    });
  }

  // Superimpose simply places an image at random coordinates (factoring in the size of the image being placed, I think..)
  superimpose(baseImage: JimpImageLike, srcImage: JimpImageLike) {
    return superimposeRandomly(baseImage, srcImage);
  }

  gmToBuffer(data: gm.State) {
    return new Promise<Buffer>((resolve, reject) => {
      data.stream((err, stdout, stderr) => {
        if (err) {
          return reject(err);
        }
        const chunks: Uint8Array[] = [];
        stdout.on("data", (chunk: Uint8Array) => {
          chunks.push(chunk);
        });
        // these are 'once' because they can and do fire multiple times for multiple errors,
        // but this is a promise so you'll have to deal with them one at a time
        stdout.once("end", () => {
          resolve(Buffer.concat(chunks));
        });
        stderr.once("data", (data) => {
          reject(String(data));
        });
      });
    });
  }

  private async fryImage(imgUrl: string): Promise<Buffer> {
    const fryConfig = config.json.commands.fry;
    if (!fryConfig) throw new Error("Fry command configuration not found");

    const pixels = getRandomInt(3, 2);
    const useOkHand = getRandomBool(fryConfig.vars.okHandProb as number);
    const useWearyFace = getRandomBool(fryConfig.vars.wearyFaceProb as number);
    const useHundred = getRandomBool(fryConfig.vars.hundredProb as number);
    const useWater = getRandomBool(fryConfig.vars.waterProb as number);

    const raw = await Jimp.read(imgUrl);
    const i = raw as unknown as JimpImageLike;
    i.pixelate(pixels)
      .posterize(fryConfig.vars.posterize as number)
      .contrast(fryConfig.vars.contrast as number)
      .color([
        {
          apply: "mix",
          params: [
            { r: 235, g: 64, b: 52 },
            fryConfig.vars.redMixOpacity as number,
          ],
        },
      ]);

    const superimposeScale = fryConfig.vars.superimposeScale as number;
    if (useHundred) {
      const imgHundred = (await Jimp.read(
        path.join(__dirname, "../../assets/fry/hundred.png"),
      )) as unknown as JimpImageLike;
      scaleImage(
        imgHundred,
        i.width * superimposeScale,
        i.height * superimposeScale,
      );
      this.superimpose(i, imgHundred);
    }
    if (useWater) {
      const imgWater = (await Jimp.read(
        path.join(__dirname, "../../assets/fry/sweat-droplets.png"),
      )) as unknown as JimpImageLike;
      imgWater.scaleToFit(
        i.width * superimposeScale,
        i.height * superimposeScale,
      );
      this.superimpose(i, imgWater);
    }
    if (useOkHand) {
      const imgOkHand = (await Jimp.read(
        path.join(__dirname, "../../assets/fry/ok-hand.png"),
      )) as unknown as JimpImageLike;
      imgOkHand.scaleToFit(
        i.width * superimposeScale,
        i.height * superimposeScale,
      );
      for (
        let q = 1;
        q <= getRandomInt(fryConfig.vars.maxHands as number, 1);
        q++
      ) {
        this.superimpose(i, imgOkHand);
      }
    }
    if (useWearyFace) {
      const imgWearyFace = (await Jimp.read(
        path.join(__dirname, "../../assets/fry/weary-face.png"),
      )) as unknown as JimpImageLike;
      imgWearyFace.scaleToFit(
        i.width * superimposeScale,
        i.height * superimposeScale,
      );
      this.superimpose(i, imgWearyFace);
    }
    const jimpOut = await i.getBufferAsync("image/jpeg");

    const out = await this.gmToBuffer(gm(jimpOut).noise("laplacian"));
    if (out.length <= 0)
      throw new Error("Buffer is empty, image could not be processed.");
    return out;
  }
}
