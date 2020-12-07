export function isURL(url: string) {
  try {
    new URL(url);
  } catch (_) {
    return false;
  }
  return true;
}

const imageUrlRegex = /https?:\/\/\S*?\.(?:png|jpe?g)(?:\?(?:(?:(?:[\w_-]+=[\w_-]+)(?:&[\w_-]+=[\w_-]+)*)|(?:[\w_-]+)))?/;

export function isImageUrl(url: string) {
  return imageUrlRegex.test(url);
}

export function getImageUrl(message: string) {
  let urls = message.match(imageUrlRegex);

  if (urls) {
    return urls[0];
  }
  return undefined;
}
