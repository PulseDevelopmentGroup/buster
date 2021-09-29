import { config } from "../lib/config";
import { IfunnyURLRegex } from "../lib/constants";
import { isURL } from "../lib/utils";

import type { ListenerOptions, PieceContext } from "@sapphire/framework";
import { Events, Listener } from "@sapphire/framework";
import type { Message } from "discord.js";

import type { Browser, Page } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

export class UserEvent extends Listener<typeof Events.MessageCreate> {
  browser: Browser | undefined;
  page: Page | undefined;

  public constructor(context: PieceContext, options?: ListenerOptions) {
    super(context, {
      ...options,
      event: Events.MessageCreate,
    });
  }

  // Fires on every message sent by a user
  public async run(message: Message) {
    if (!this.browser || !this.page) return;

    // Hopefully ignore as much as we can to reduce load on the bot
    if (message.author.bot || message.content === "") {
      return;
    }

    const ifunny = IfunnyURLRegex.exec(message.content);

    // If the regex returned nothing or what it returned isn't a URL, exit
    if (!ifunny || !isURL(ifunny[0])) {
      return;
    }

    // Let the user know what's going on
    const notification = await message.channel.send(
      "That looks like an iFunny link, I'll try and grab the image for you....",
    );

    const url = await this.getDirect(this.page, ifunny[1], ifunny[0]);

    if (!url) {
      return notification.edit(
        "Unfortunately I can't find an image/video associated with that link.",
      );
    }

    return notification.edit(url);
  }

  public async getDirect(
    page: Page,
    type: string,
    url: string,
  ): Promise<string | null> {
    if (type === "picture") type = "image";
    if (type === "video") type = "video:url";

    await page.goto(url);
    const directUrl = await page.$eval(
      `head > meta[property='og:${type}']`,
      (meta) => meta.getAttribute("content"),
    );
    page.close();

    return directUrl;
  }

  // Only enable if listener is enabled
  public async onLoad() {
    this.enabled = config.listeners.includes(this.name);

    if (this.enabled) {
      // May need to disable/configure these (outside of defaults) if not working
      puppeteer.use(StealthPlugin());

      this.browser = await puppeteer.use(StealthPlugin()).launch({
        headless: true,
        ignoreHTTPSErrors: true,
        executablePath: "google-chrome-stable",
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-background-networking",
          "--disable-default-apps",
          "--disable-extensions",
          "--disable-sync",
          "--disable-translate",
          "--metrics-recording-only",
          "--mute-audio",
          "--no-first-run",
          "--ignore-certificate-errors",
          "--ignore-ssl-errors",
          "--ignore-certificate-errors-spki-list",
          "--safebrowsing-disable-auto-update",
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
