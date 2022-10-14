import { MessageAttachment } from "discord.js";
import { isImageURL, getImageUrl } from "../../lib/utils";
import jimp from "jimp";
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { config } from "../../lib/config";
import { ApplicationCommandType } from "discord-api-types/v9";
import { isMessageInstance } from "@sapphire/discord.js-utilities";

@ApplyOptions<CommandOptions>(
  config.applyConfig("jpeg", {
    name: "JPEG",
    description: "More JPEG. 'nuff said",
  }),
)
export class JpegCommand extends Command {
  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ) {
    registry
      .registerContextMenuCommand((builder) =>
        builder.setName(this.name).setType(ApplicationCommandType.Message),
      )
      .registerContextMenuCommand((builder) =>
        builder.setName(this.name).setType(ApplicationCommandType.User),
      );
  }

  public override async contextMenuRun(
    interaction: Command.ContextMenuInteraction,
  ) {
    if (
      interaction.isMessageContextMenu() &&
      isMessageInstance(interaction.targetMessage)
    ) {
      const msg = interaction.targetMessage;

      const url = msg.attachments.first()?.url ?? getImageUrl(msg.content);
      if (!url || !isImageURL(url)) {
        return interaction.reply(
          "The specified message doesn't appear to have any JPEGifiable attachments.",
        );
      }

      try {
        const attachment = await JpegCommand.jpegify(url);
        return interaction.reply({
          files: [new MessageAttachment(attachment)],
        });
      } catch (e) {
        this.container.client.logger.error(e);
        return interaction.reply({
          content: "Unable to JPEGify the image D:",
        });
      }
    } else if (interaction.isUserContextMenu()) {
      const pfpUrl = interaction.targetUser.displayAvatarURL().slice(0, -5);

      try {
        const attachment = await JpegCommand.jpegify(pfpUrl);
        return interaction.reply({
          files: [new MessageAttachment(attachment)],
        });
      } catch (e) {
        this.container.client.logger.error(e);
        return interaction.reply({
          content: "Unable to JPEGify the image D:",
        });
      }
    }

    return;
  }

  private static async jpegify(url: string): Promise<Buffer> {
    return await jimp.read(url).then((i) => {
      return i
        .posterize(config.json.commands.jpeg.vars.posterize)
        .quality(config.json.commands.jpeg.vars.jpeg)
        .getBufferAsync(jimp.MIME_JPEG);
    });
  }
}
