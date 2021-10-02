import type { ListenerOptions, PieceContext } from "@sapphire/framework";
import { Events, Listener } from "@sapphire/framework";
//import type { Message } from "discord.js";
import { config } from "../../lib/config";

export class UserEvent extends Listener<typeof Events.MessageCreate> {
  public constructor(context: PieceContext, options?: ListenerOptions) {
    super(context, {
      ...options,
      event: Events.MessageCreate,
    });
  }

  // Fires on every message sent by a user
  public run(/*message: Message*/) {
    return;
  }

  // Only enable if logCommands is true or we are in a dev enviornment
  public onLoad() {
    this.enabled = config.json.listeners.includes(this.name);
    return super.onLoad();
  }
}
