import { ApplicationCommandRegistry, Command } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { fetch, FetchResultTypes } from "@sapphire/fetch";
import { MessageAttachment, User } from "discord.js";
import GifEncoder from "gifencoder";
import { Readable } from "stream";
import sharp from "sharp";
import path from "path";
import { config } from "../../lib/config";
import { ApplicationCommandType } from "discord-api-types/v9";
import { randomUUID } from "crypto";

@ApplyOptions(
  config.applyConfig("triggered", {
    name: "triggered",
    description: "Trigger people",
    preconditions: ["GuildOnly"],
  }),
)
export default class TriggeredCommand extends Command {
  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ) {
    registry.registerChatInputCommand((builder) => {
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("User to trigger")
            .setRequired(false),
        );
    });

    registry.registerContextMenuCommand((builder) => {
      builder.setName(this.name).setType(ApplicationCommandType.User);
    });
  }

  public override async chatInputRun(
    interaction: Command.ChatInputInteraction,
  ) {
    let target = interaction.options.getUser("user", false);

    if (!target) {
      target = interaction.user;
    }

    const attachment = await this.trigger(target);

    interaction.reply({ files: [attachment] });
  }

  public override async contextMenuRun(
    interaction: Command.ContextMenuInteraction,
  ) {
    let target: User | undefined;

    if (interaction.isUserContextMenu()) {
      target = interaction.targetUser;
    }

    if (!target)
      return interaction.reply({
        ephemeral: true,
        content: "Unable to get user to trigger",
      });

    const attachment = await this.trigger(target);

    interaction.reply({ files: [attachment] });
  }

  async trigger(user: User): Promise<MessageAttachment> {
    const scale = 20;

    const pfp = await fetch(user.displayAvatarURL(), FetchResultTypes.Buffer);

    const basePfp = sharp(pfp)
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
        .png({
          quality: 1,
        })
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
        .composite([
          {
            input: overlay,
            gravity: "south",
          },
        ]);

      const buffer = await trimmedPfp.raw().toBuffer();

      shiftedPfps.push(buffer);
    }

    const encoder = new GifEncoder(imageWidth, imageWidth);

    shiftedPfps.forEach((shift) => {
      Readable.from(shift).pipe(
        encoder.createWriteStream({
          repeat: 0,
          delay: 100,
          quality: 1,
        }),
      );
    });

    const chunks = [];
    for await (const chunk of encoder.createReadStream()) {
      chunks.push(chunk);
    }

    return Promise.resolve(
      new MessageAttachment(Buffer.concat(chunks), `${randomUUID()}.gif`),
    );
  }
}
