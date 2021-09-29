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
  public async run(message: Message) {
    // Hopefully ignore as much as we can to reduce load on the bot
    if (message.author.bot || message.content === "") {
      return;
    }

    const ifunny = IfunnyURLRegex.exec(message.content);

    if (!ifunny || !isURL(ifunny[0])) {
      return;
    }

    const notification = await message.channel.send(
      "That looks like an iFunny link, I'll try and grab the image for you....",
    );

    const url = await this.getDirect(ifunny[1], ifunny[0]);

    await this.reset();

    if (!url) {
      return notification.edit(
        "Unfortunately I can't find an image/video associated with that link.",
      );
    }

    return notification.edit(url);
  }

  public async getDirect(type: string, url: string): Promise<string | null> {
    return new Promise<string | null>((res) => {
      if (!this.page) return res(null);

      if (type === "picture") type = "image";
      if (type === "video") type = "video:url";

      this.page.goto(url);
      return res(
        this.page.$eval(`head > meta[property='og:${type}']`, (meta) =>
          meta.getAttribute("content"),
        ),
      );
    });
  }

  public async reset() {
    await this.page?.goto("about:blank");
    await this.page?.close();
    this.page = await this.browser?.newPage();
  }

  // Only enable if listener is enabled
  public async onLoad() {
    this.enabled = config.listeners.includes(this.name);

    if (this.enabled) {
      this.browser = await puppeteer.launch({
        headless: true,
        ignoreHTTPSErrors: true,
        executablePath: "google-chrome-stable",
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"',
        ],
      });
      this.page = await this.browser.newPage();

      // Disable image and CSS loading
      await this.page.setRequestInterception(true);
      this.page.on("request", (req) => {
        if (
          req.resourceType() === "image" ||
          req.resourceType() === "stylesheet" ||
          req.resourceType() === "font"
        ) {
          req.abort();
        } else {
          req.continue();
        }
      });
    }

    return super.onLoad();
  }
}
