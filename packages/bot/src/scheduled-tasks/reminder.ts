import { ScheduledTask } from "@sapphire/plugin-scheduled-tasks";
import type { TextChannel } from "discord.js";
import type { Reminder } from "../lib/models";

export class RemindTask extends ScheduledTask {
  public async run({ who, what, where, reminder }: Reminder) {
    const channel = this.container.client.channels.cache.find(
      (c) => c.id === where,
    ) as TextChannel | undefined;

    const _reminder = this.container.client.users.cache.find(
      (u) => u.id === reminder,
    );
    const _remindee = this.container.client.users.cache.find(
      (u) => u.id === who,
    );

    if (!channel || !_remindee) return;

    return channel.send(
      `${_remindee.toString()}, ${
        _reminder === _remindee ? "you" : _reminder?.toString()
      } wanted me to remind you: "${what}"`,
    );
  }
}

declare module "@sapphire/framework" {
  interface ScheduledTasks {
    reminder: never;
  }
}
