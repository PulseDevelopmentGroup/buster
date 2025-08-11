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
import { config } from "../../lib/config";
import { createJpegBuffer } from "../../lib/imageUtils";
import { registerSlash } from "../../lib/registry";
import {
  handleCommandError,
  parseImageInputFromInteraction,
  parseImageInputFromMessage,
} from "../../lib/utils";

// Using the standard Jimp instance with all built-in plugins

@ApplyOptions<CommandOptions>(
  config.applyConfig("jpeg", {
    description: "More JPEG. 'nuff said",
  }),
)
export class JpegCommand extends Command {
  public override async messageRun(msg: Message, args: Args) {
    const target = !args.finished ? await args.rest("string") : undefined;

    const parseResult = await parseImageInputFromMessage(msg, target);

    if (!parseResult.success) {
      return send(msg, parseResult.error);
    }

    try {
      const attachment = await this.generateJpegAttachment(
        parseResult.imageUrl,
      );
      return send(msg, { files: [attachment] });
    } catch (e) {
      const errorMessage = handleCommandError({
        error: e,
        context: "jpeg command",
        userMessage: "Unable to JPEGify the image D:",
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
      const attachment = await this.generateJpegAttachment(
        parseResult.imageUrl,
      );
      return interaction.reply({ files: [attachment] });
    } catch (e) {
      const errorMessage = handleCommandError({
        error: e,
        context: "jpeg slash command",
        userMessage: "Unable to JPEGify the image D:",
      });
      return interaction.reply({
        content: errorMessage,
        flags: ["Ephemeral"],
      });
    }
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ) {
    registerSlash(registry, (b) => {
      b.setName(this.name)
        .setDescription(this.description)
        .addAttachmentOption((o) =>
          o
            .setName("image")
            .setDescription("Image to process")
            .setRequired(false),
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

  private async generateJpegBuffer(imgUrl: string): Promise<Buffer> {
    const jpegConfig = config.json.commands.jpeg;
    if (!jpegConfig) throw new Error("JPEG configuration not found");

    return createJpegBuffer(imgUrl, jpegConfig.vars.posterize as number);
  }

  private async generateJpegAttachment(
    imgUrl: string,
  ): Promise<AttachmentBuilder> {
    const buffer = await this.generateJpegBuffer(imgUrl);
    return new AttachmentBuilder(buffer, { name: "jpeg.jpg" });
  }
}
