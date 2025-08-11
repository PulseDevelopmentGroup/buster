import { URL } from "node:url";
import type { ChatInputCommandInteraction, Message } from "discord.js";
import { ImageURLRegex } from "./constants";

/**
 * Picks a random item from an array
 * @param array The array to pick a random item from
 * @example
 * const randomEntry = pickRandom([1, 2, 3, 4]) // 1
 */
export function pickRandom<T>(array: readonly T[]): T {
  const { length } = array;
  if (length === 0) throw new Error("Array cannot be empty");
  return array[Math.floor(Math.random() * length)] as T;
}

/**
 * Tests a string to see if it is a valid URL
 * @param url The string to test for a valid URL
 * @returns Boolean indicating whether the string is a valid URL
 */
export function isURL(url: string) {
  try {
    new URL(url);
  } catch (_) {
    return false;
  }
  return true;
}

/**
 * Tests a string to see if it is a valid image URL
 * @param url The string to test for a valid image URL
 * @returns Boolean indicating whether the string is a valid image URL
 */
export function isImageURL(url: string) {
  return ImageURLRegex.test(url);
}

/**
 * Gets the image URL from a message
 * @param message The string to extract an image URL from
 * @returns The image URL if one exists, otherwise undefined
 */
export function getImageUrl(message: string) {
  const urls = message.match(ImageURLRegex);

  if (urls) return urls[0];

  return;
}

/**
 * Gets a random int between two numbers
 * @param max The maximum number to generate
 * @param min The minimum number to generate
 * @returns A number between the max and min supplied
 */
export function getRandomInt(max: number, min?: number): number {
  if (!min) min = 0;

  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Gets a random boolean
 * @param probability The probability of returning true (0-1)
 * @returns A random boolean
 */
export function getRandomBool(probability?: number): boolean {
  // Return if probability is <=/>= 0 or 1
  if (probability !== undefined && probability >= 1) return true;
  if (probability !== undefined && probability <= 0) return false;

  if (!probability) probability = 0.5;

  return Math.random() < probability;
}

/**
 * Represents the result of parsing image input from a command
 */
export interface ImageInputResult {
  imageUrl: string;
  success: true;
}

export interface ImageInputError {
  error: string;
  success: false;
}

export type ImageInputParseResult = ImageInputResult | ImageInputError;

/**
 * Parses image input from a message command context
 * Handles mentions, attachments, URLs, message IDs, and previous messages
 * @param message The Discord message
 * @param target Optional target parameter (URL, mention, or message ID)
 * @returns Parsed image URL or error message
 */
export async function parseImageInputFromMessage(
  message: Message,
  target?: string,
): Promise<ImageInputParseResult> {
  const mentioned = message.mentions?.users?.first();

  if (!target) {
    // If no target param exists, try to get from previous message
    const messages = await message.channel.messages.fetch({
      before: message.id,
      limit: 1,
    });
    const [[, lastMessage] = []] = messages || [];

    if (!lastMessage) {
      return { error: "Unable to fetch previous message.", success: false };
    }

    const url =
      lastMessage.attachments.first()?.url ?? getImageUrl(lastMessage.content);

    if (!url) {
      return {
        error:
          "There doesn't appear to be an image in the last message. Try specifying a message ID.",
        success: false,
      };
    }

    if (!isImageURL(url)) {
      return {
        error: "I can't seem to recognize that attachment as an image D:",
        success: false,
      };
    }

    return { imageUrl: url, success: true };
  }

  if (isImageURL(target)) {
    // If target param is a URL
    return { imageUrl: target, success: true };
  }

  if (mentioned) {
    // If target param is a mention, use their avatar
    return {
      imageUrl: mentioned.displayAvatarURL().slice(0, -5),
      success: true,
    };
  }

  // If target param is not a URL, try to treat it as a message ID
  try {
    const targetMessage = await message.channel.messages.fetch(target);

    if (!targetMessage) {
      return {
        error: `Unable to find message with the ID: \`${target}\`.`,
        success: false,
      };
    }

    const msgAttachment = targetMessage.attachments.first();

    if (!msgAttachment) {
      return {
        error: "The specified message doesn't have any attachments.",
        success: false,
      };
    }

    if (!isImageURL(msgAttachment.url)) {
      return {
        error:
          "The specified message doesn't appear to have any image attachments.",
        success: false,
      };
    }

    return { imageUrl: msgAttachment.url, success: true };
  } catch {
    return {
      error: `Unable to find message with the ID: \`${target}\`.`,
      success: false,
    };
  }
}

/**
 * Parses image input from a slash command interaction
 * Handles attachment options, user options, and string URL options
 * @param interaction The Discord slash command interaction
 * @param attachmentOption The name of the attachment option (default: "image")
 * @param userOption The name of the user option (default: "user")
 * @param inputOption The name of the string input option (default: "input")
 * @returns Parsed image URL or error message
 */
export function parseImageInputFromInteraction(
  interaction: ChatInputCommandInteraction,
  attachmentOption = "image",
  userOption = "user",
  inputOption = "input",
): ImageInputParseResult {
  const image = interaction.options.getAttachment(attachmentOption);
  const user = interaction.options.getUser(userOption);
  const input = interaction.options.getString(inputOption);

  if (image && isImageURL(image.url)) {
    return { imageUrl: image.url, success: true };
  }

  if (user) {
    return { imageUrl: user.displayAvatarURL().slice(0, -5), success: true };
  }

  if (input && isImageURL(input)) {
    return { imageUrl: input, success: true };
  }

  return { error: "Provide an image, user, or URL.", success: false };
}

/**
 * Gets a user's avatar URL from a message context
 * Prioritizes mentioned users, falls back to message author
 * @param message The Discord message
 * @returns Avatar URL without the file extension
 */
export function getAvatarUrl(message: Message): string {
  const mentioned = message.mentions?.users?.first();
  const user = mentioned ?? message.author;
  return user.displayAvatarURL().slice(0, -5);
}

/**
 * Standardized error handling for commands
 */
export interface CommandErrorOptions {
  /** The error that occurred */
  error: unknown;
  /** Context information for logging */
  context: string;
  /** User-facing error message */
  userMessage?: string;
  /** Whether to log the error (default: true) */
  shouldLog?: boolean;
}

/**
 * Handles command errors consistently with logging and user feedback
 * @param options Error handling options
 * @returns User-friendly error message
 */
export function handleCommandError(options: CommandErrorOptions): string {
  const {
    error,
    context,
    userMessage = "An error occurred while processing your request.",
    shouldLog = true,
  } = options;

  if (shouldLog) {
    // Import logger dynamically to avoid circular dependencies
    import("./logger").then(({ logger }) => {
      logger.command.error(`${context}: ${error}`);
    });
  }

  return userMessage;
}
