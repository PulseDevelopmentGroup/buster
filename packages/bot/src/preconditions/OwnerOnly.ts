import { Precondition } from "@sapphire/framework";
import type { Message } from "discord.js";
import { config } from "../lib/config";

export class UserPrecondition extends Precondition {
  public async messageRun(message: Message) {
    return config.json.owners.includes(message.author.id)
      ? this.ok()
      : this.error({ message: "This command can only be used by the owner." });
  }
}

declare module "@sapphire/framework" {
  interface Preconditions {
    OwnerOnly: never;
  }
}
