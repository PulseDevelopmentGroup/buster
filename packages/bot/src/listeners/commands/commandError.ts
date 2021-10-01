import type { CommandErrorPayload, Events } from "@sapphire/framework";
import { Listener } from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";

export class UserEvent extends Listener<typeof Events.CommandError> {
  public async run(e: Error, payload: CommandErrorPayload) {
    await payload.message.guild?.channels
      .fetch("893296394478182450")
      .then((channel) => {
        if (channel?.isText()) {
          channel.send(e.message);
        }
      });

    await send(payload.message, "Sorry, something went wrong :(");
  }
}
