export function isURL(url: string) {
  try {
    new URL(url);
  } catch (_) {
    return false;
  }
  return true;
}

const imageUrlRegex =
  /https?:\/\/\S*?\.(?:png|jpe?g)(?:\?(?:(?:(?:[\w_-]+=[\w_-]+)(?:&[\w_-]+=[\w_-]+)*)|(?:[\w_-]+)))?/;

export function isImageUrl(url: string) {
  return imageUrlRegex.test(url);
}

export function getImageUrl(message: string) {
  let urls = message.match(imageUrlRegex);

  if (urls) return urls[0];

  return undefined;
}

export function getRandomInt(max: number, min?: number): number {
  if (!min) min = 0;

  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function getRandomBool(probability?: number): boolean {
  // Return if probability is <=/>= 0 or 1
  if (probability != undefined && probability >= 1) return true;
  if (probability != undefined && probability <= 0) return false;

  if (!probability) probability = 0.5;

  return Math.random() < probability;
}
