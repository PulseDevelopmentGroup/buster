import path from "node:path";
import { Readable } from "node:stream";
import { ApplyOptions } from "@sapphire/decorators";
import { FetchResultTypes, fetch } from "@sapphire/fetch";
import {
  type ApplicationCommandRegistry,
  Command,
  type CommandOptions,
} from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import {
  AttachmentBuilder,
  type ChatInputCommandInteraction,
  type Message,
} from "discord.js";
import GifEncoder from "gifencoder";
import sharp from "sharp";
import { config } from "../../lib/config";
import { registerSlash } from "../../lib/registry";
import { getAvatarUrl, parseImageInputFromInteraction } from "../../lib/utils";

@ApplyOptions<CommandOptions>(
  config.applyConfig("triggered", {
    name: "triggered",
    description: "Trigger people",
    preconditions: ["GuildOnly"],
  }),
)
export default class TriggeredCommand extends Command {
  override async messageRun(msg: Message) {
    const pfpUrl = getAvatarUrl(msg);
    if (msg.channel.isSendable()) msg.channel.sendTyping();
    const { out, filename } = await this.generateTriggeredGif(
      pfpUrl,
      msg.author.username,
    );
    const attachment = new AttachmentBuilder(out, { name: filename });
    return send(msg, { files: [attachment] });
  }

  public override async chatInputRun(interaction: ChatInputCommandInteraction) {
    const parseResult = parseImageInputFromInteraction(
      interaction,
      undefined,
      "user",
    );

    let pfpUrl: string;
    if (parseResult.success) {
      pfpUrl = parseResult.imageUrl;
    } else {
      // Fallback to interaction user's avatar
      pfpUrl = interaction.user.displayAvatarURL();
    }

    await interaction.deferReply();
    const { out, filename } = await this.generateTriggeredGif(
      pfpUrl,
      interaction.user.username,
    );
    const attachment = new AttachmentBuilder(out, { name: filename });
    return interaction.editReply({ files: [attachment] });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ) {
    registerSlash(registry, (b) => {
      b.setName(this.name)
        .setDescription(this.description)
        .addUserOption((o) =>
          o.setName("user").setDescription("Target user").setRequired(false),
        );
      return b;
    });
  }

  private async generateTriggeredGif(
    pfpUrl: string,
    username: string,
  ): Promise<{ out: Buffer; filename: string }> {
    const scale = 20;
    const pfp = await fetch(pfpUrl, FetchResultTypes.Buffer);
    const basePfp = await sharp(pfp)
      .blur(2)
      .sharpen(3)
      .rotate(3)
      .gamma(1.2)
      .convolve({
        width: 3,
        height: 3,
        kernel: [-1, -1, -1, -1, 8, 1, -1, -1, -1],
        scale: 250,
      });
    const imageMeta = await basePfp.metadata();
    const imageWidth = imageMeta.width ?? 128;
    const shiftedPfps: Buffer[] = [];
    for (let i = 0; i < 20; i++) {
      const offsetX = Math.floor(Math.random() * scale);
      const offsetY = Math.floor(Math.random() * scale);
      const offsetX2 = Math.floor((Math.random() * scale) / 3);
      const offsetY2 = Math.floor((Math.random() * scale) / 3);
      const overlay = await sharp(
        path.join(__dirname, "../../assets/triggered.png"),
      )
        .png({ quality: 1 })
        .blur(1.2)
        .extract({
          left: offsetX2,
          top: offsetY2,
          width: imageWidth - offsetX2 - Math.round(offsetX2 * Math.random()),
          height: imageWidth - offsetY2 - Math.round(offsetY2 * Math.random()),
        })
        .resize(128, 128)
        .toBuffer();
      const trimmedPfp = basePfp
        .clone()
        .extract({
          left: offsetX,
          top: offsetY,
          width: imageWidth - offsetX - Math.round(offsetX * Math.random()),
          height: imageWidth - offsetY - Math.round(offsetY * Math.random()),
        })
        .resize(128, 128)
        .composite([{ input: overlay, gravity: "south" }]);
      const buffer = await trimmedPfp.raw().toBuffer();
      shiftedPfps.push(buffer);
    }
    const encoder = new GifEncoder(imageWidth, imageWidth);
    shiftedPfps.forEach((shift) => {
      Readable.from(shift).pipe(
        encoder.createWriteStream({ repeat: 0, delay: 100, quality: 1 }),
      );
    });
    const chunks: Uint8Array[] = [];
    for await (const chunk of encoder.createReadStream()) {
      chunks.push(chunk as Uint8Array);
    }
    const out = Buffer.concat(chunks);
    return { out, filename: `${username}-triggered.gif` };
  }
}
