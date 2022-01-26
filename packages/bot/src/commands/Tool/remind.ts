import { Args, Command, CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import type { Message } from "discord.js";
import { config } from "../../lib/config";
import { db } from "../../lib/db";
import * as chrono from "chrono-node";
import type { Reminder } from "../../lib/models";

// Configure the command to only work in regular text channels, if Redis is enabled.
@ApplyOptions<CommandOptions>(
  config.applyConfig("remind", {
    description: "Remind me.. or you... or someone else",
    preconditions: ["NoThreads"],
    enabled: db.enabled,
  }),
)
export default class RemindCommand extends Command {
  async messageRun(msg: Message, args: Args) {
    const now = new Date();

    /* Error handling! */
    const who = await args.pick("user").catch(() => undefined);
    if (!who) return msg.reply("You must specify who to remind.");

    const what = await args.pick("string").catch(() => undefined);
    if (!what) return msg.reply("You must specify what to remind.");

    const when = await args.rest("string");
    if (!when) return msg.reply("You must specify when to remind.");

    /* Build payload and perform final checks */
    const payload: Reminder = {
      reminder: msg.author.id,
      who: who.id,
      what: what,
      when: chrono.parseDate(when, now, { forwardDate: true }),
      where: msg.channel.id,
    };

    if (payload.when < now) {
      return msg.reply(
        "The date/time you asked to be reminded on is in the past.",
      );
    }

    /* Create reminder and inform user */
    this.container.tasks.create(
      "reminder",
      payload,
      payload.when.getTime() - now.getTime(),
    );

    return msg.reply(
      `Reminder set for ${payload.when.toLocaleString("en-US", {
        timeZone: "America/New_York",
        dateStyle: this.isToday(payload.when) ? undefined : "full",
        timeStyle: "short",
      })}`,
    );
  }

  // Checks supplied date against current date to see if the day is the same
  isToday(date: Date): boolean {
    const now = new Date();
    return (
      date.getDate() == now.getDate() &&
      date.getMonth() == now.getMonth() &&
      date.getFullYear() == now.getFullYear()
    );
  }
}
