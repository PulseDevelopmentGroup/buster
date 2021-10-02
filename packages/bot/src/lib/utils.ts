import { URL } from "url";
import { ImageURLRegex } from "./constants";

/**
 * Picks a random item from an array
 * @param array The array to pick a random item from
 * @example
 * const randomEntry = pickRandom([1, 2, 3, 4]) // 1
 */
export function pickRandom<T>(array: readonly T[]): T {
  const { length } = array;
  return array[Math.floor(Math.random() * length)];
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

  return undefined;
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
  if (probability != undefined && probability >= 1) return true;
  if (probability != undefined && probability <= 0) return false;

  if (!probability) probability = 0.5;

  return Math.random() < probability;
}
