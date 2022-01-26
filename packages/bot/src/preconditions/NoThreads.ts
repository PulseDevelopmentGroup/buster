import { Precondition } from "@sapphire/framework";
import type { Message } from "discord.js";

export class UserPrecondition extends Precondition {
  public async run(message: Message) {
    return !message.channel.isThread()
      ? this.ok()
      : this.error({
          message: "This command cannot be used in threads.",
        });
  }
}

declare module "@sapphire/framework" {
  interface Preconditions {
    NoThreads: never;
  }
}
