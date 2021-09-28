import type { CommandOptions } from "@sapphire/framework";
import { join } from "path";

export const RootDir = join(__dirname, "..", "..");
export const SrcDir = join(RootDir, "src");

export const RandomLoadingMessage = [
  "Computing...",
  "Thinking...",
  "Cooking some food",
  "Give me a moment",
  "Loading...",
];

export const IfunnyURLRegex =
  /https:\/\/(?:www\.)?ifunny\.co\/(picture|video)\/(\w*){9}/;

export const ImageURLRegex =
  /https?:\/\/\S*?\.(?:png|jpe?g)(?:\?(?:(?:(?:[\w_-]+=[\w_-]+)(?:&[\w_-]+=[\w_-]+)*)|(?:[\w_-]+)))?/;

// See https://sapphiredev.github.io/framework/interfaces/CommandOptions.html for more info
export const CommandOptionsFields = [
  "aliases",
  "cooldownDelay",
  "cooldownFilteredUsers",
  "cooldownLimit",
  "cooldownScope",
  "description",
  "detailedDescription",
  "enabled",
  "flags",
  "fullCategory",
  "generateDashLessAliases",
  "name",
  "nsfw",
  "options",
  "preconditions",
  "prefixes",
  "quotes",
  "requiredClientPermissions",
  "requiredUserPermissions",
  "runIn",
  "separators",
  "typing",
] as (keyof CommandOptions)[];

export const TENOR_URL = "https://api.tenor.com/v1/random";

export const INSPIRE_URL = "http://inspirobot.me/api";

export const PERSPECTIVE_URL =
  "https://commentanalyzer.googleapis.com/$discovery/rest?version=v1alpha1";

export const EMBED_COLOR = "#DBC12F";
