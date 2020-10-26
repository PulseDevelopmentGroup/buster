export function isURL(url: string) {
  try {
    new URL(url);
  } catch (_) {
    return false;
  }
  return true;
}

const imageUrlRegex = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|jpeg|png|JPG|JPEG|PNG)/;

export function isImageUrl(url: string) {
  return imageUrlRegex.test(url);
}