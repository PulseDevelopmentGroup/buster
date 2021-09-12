import { Precondition } from "@sapphire/framework";
import type { Message } from "discord.js";
import { config } from "../config";

export class UserPrecondition extends Precondition {
  public async run(message: Message) {
    return config.owners.includes(message.author.id)
      ? this.ok()
      : this.error({ message: "This command can only be used by the owner." });
  }
}

declare module "@sapphire/framework" {
  interface Preconditions {
    OwnerOnly: never;
  }
}
