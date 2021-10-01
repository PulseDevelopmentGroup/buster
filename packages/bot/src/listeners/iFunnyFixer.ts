import { botConfig } from "../lib/config";
import { IfunnyURLRegex } from "../lib/constants";
import { isURL } from "../lib/utils";

import type { ListenerOptions, PieceContext } from "@sapphire/framework";
import { Events, Listener } from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import { Message, MessageEmbed } from "discord.js";

import type { Browser, Page } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

export class UserEvent extends Listener<typeof Events.MessageCreate> {
  browser: Browser | undefined;

  public constructor(context: PieceContext, options?: ListenerOptions) {
    super(context, {
      ...options,
      event: Events.MessageCreate,
    });
  }

  // Fires on every message sent by a user
  public async run(message: Message) {
    if (!this.browser) return;

    // Hopefully ignore as much as we can to reduce load on the bot
    if (message.author.bot || message.content === "") {
      return;
    }

    // Get the URL from the message
    const ifunny = IfunnyURLRegex.exec(message.content);

    // If the regex returned nothing or what it returned isn't a URL, exit
    if (!ifunny || !isURL(ifunny[0])) {
      return;
    }

    // Let the user know what's going on
    const notification = await message.reply(
      `That looks like an iFunny link, I'll try and grab the ${ifunny[1]} for you....`,
    );

    // Create a new page
    const page = await this.newPage();

    // Attempt to get URL and close the page
    let url = "";
    if (page) {
      url = await this.getDirect(page, ifunny[1], ifunny[0]);
      await this.closePage(page);
    }

    // If either the URL or page are empty, error
    if (!url) {
      return notification.edit(
        `Unfortunately I can't find an ${ifunny[1]} associated with that link.`,
      );
    }

    // Change the response depending on the type of content
    if (ifunny[1] === "video") {
      return notification.edit(`Here it is! ${url}`);
    }

    notification.delete();

    return send(notification, {
      embeds: [new MessageEmbed().setImage(url).setColor("#FFCC00")],
    });
  }

  // Close the page to free up memory
  public async closePage(page: Page) {
    if (!this.browser) return;
    await page.close();
  }

  // Create a new page
  public async newPage(): Promise<Page | undefined> {
    if (!this.browser) return;

    const page = await this.browser.newPage();

    // Disable image and CSS loading
    await page.setRequestInterception(true);
    await page.setJavaScriptEnabled(false);
    page.on("request", (req) => {
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

    return page;
  }

  // Get direct link to iFunny content
  public async getDirect(
    page: Page,
    type: string,
    url: string,
  ): Promise<string> {
    if (type === "picture") type = "image";
    if (type === "video") type = "video:url";

    await page.goto(url);
    const directUrl = await page.$eval(
      `head > meta[property='og:${type}']`,
      (meta) => meta.getAttribute("content"),
    );
    page.close();

    return directUrl ?? "";
  }

  // Only enable if listener is enabled
  public async onLoad() {
    this.enabled = botConfig.configFile.listeners.includes(this.name);

    if (this.enabled) {
      // May need to disable/configure these (outside of defaults) if not working
      puppeteer.use(StealthPlugin());

      this.browser = await puppeteer.use(StealthPlugin()).launch({
        headless: true,
        ignoreHTTPSErrors: true,
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
          "--disable-dev-shm-usage",
          "--ignore-certificate-errors-spki-list",
          "--safebrowsing-disable-auto-update",
          '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"',
        ],
      });
    }
    return super.onLoad();
  }
}
