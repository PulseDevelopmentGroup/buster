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
