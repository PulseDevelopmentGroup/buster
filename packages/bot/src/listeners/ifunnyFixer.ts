import type { ListenerOptions, PieceContext } from "@sapphire/framework";
import { Events, Listener } from "@sapphire/framework";
import type { Message } from "discord.js";
import { config } from "../lib/config";
import { IfunnyURLRegex } from "../lib/constants";
import puppeteer from "puppeteer";
import { isURL } from "../lib/utils";

export class UserEvent extends Listener<typeof Events.MessageCreate> {
  browser: puppeteer.Browser | undefined;
  page: puppeteer.Page | undefined;

  public constructor(context: PieceContext, options?: ListenerOptions) {
    super(context, {
      ...options,
      event: Events.MessageCreate,
    });
  }

  // Fires on every message sent by a user
  public run(message: Message) {
    // Hopefully ignore as much as we can to reduce load on the bot
    if (message.author.bot || message.content === "") {
      return;
    }

    const ifunny = IfunnyURLRegex.exec(message.content);

    if (!ifunny || !isURL(ifunny[0])) {
      return;
    }

    switch (ifunny[1]) {
      case "picture":
        return this.getImage(ifunny[0]);
      //case "video":
      //return this.getVideo(ifunny[0]);
      default:
        return;
    }
  }

  public async getImage(url: string) {
    if (!this.page) return;

    await this.page.goto(url);
    const meta = await this.page.$("head > meta[property='og:image']");
    const imageUrl = await this.page.evaluate((meta) => meta.content, meta);

    console.log(imageUrl);
  }

  //public getVideo(url: string) {}

  // Only enable if listener is enabled
  public async onLoad() {
    this.enabled = config.listeners.includes(this.name);

    if (this.enabled) {
      this.browser = await puppeteer.launch();
      this.page = await this.browser.newPage();
    }

    return super.onLoad();
  }
}
