import { Jimp } from "jimp";

/**
 * Common interface for Jimp image operations
 * This consolidates the repeated interface definitions across commands
 */
export interface JimpImageLike {
  width: number;
  height: number;
  pixelate(n: number): this;
  posterize(n: number): this;
  contrast(n: number): this;
  color(
    ops: Array<{ apply: string; params: [Record<string, number>, number] }>,
  ): this;
  scaleToFit(w: number, h: number): this;
  blit(src: JimpImageLike, x: number, y: number): this;
  getBufferAsync(mime: string): Promise<Buffer>;
}

/**
 * Loads an image from URL and returns it as a JimpImageLike
 * @param imageUrl The URL of the image to load
 * @returns Promise resolving to JimpImageLike image
 */
export async function loadImage(imageUrl: string): Promise<JimpImageLike> {
  const image = await Jimp.read(imageUrl);
  return image as unknown as JimpImageLike;
}

/**
 * Creates a JPEG buffer from an image with posterization
 * @param imageUrl The URL of the image to process
 * @param posterizeLevel The posterize level (default: 8)
 * @returns Promise resolving to JPEG buffer
 */
export async function createJpegBuffer(
  imageUrl: string,
  posterizeLevel = 8,
): Promise<Buffer> {
  const image = await loadImage(imageUrl);
  return image.posterize(posterizeLevel).getBufferAsync("image/jpeg");
}

/**
 * Applies deepfry effects to an image
 * @param imageUrl The URL of the image to process
 * @param options Deepfry configuration options
 * @returns Promise resolving to processed JimpImageLike
 */
export async function applyDeepfryEffects(
  imageUrl: string,
  options: {
    pixels?: number;
    posterize?: number;
    contrast?: number;
    redMixOpacity?: number;
  },
): Promise<JimpImageLike> {
  const {
    pixels = 2,
    posterize = 8,
    contrast = 0.5,
    redMixOpacity = 0.3,
  } = options;

  const image = await loadImage(imageUrl);

  return image
    .pixelate(pixels)
    .posterize(posterize)
    .contrast(contrast)
    .color([
      {
        apply: "mix",
        params: [{ r: 235, g: 64, b: 52 }, redMixOpacity],
      },
    ]);
}

/**
 * Superimposes one image onto another at random coordinates
 * @param baseImage The base image to composite onto
 * @param srcImage The source image to composite
 * @returns The modified base image
 */
export function superimposeRandomly(
  baseImage: JimpImageLike,
  srcImage: JimpImageLike,
): JimpImageLike {
  const x = Math.floor(Math.random() * (baseImage.width - srcImage.width));
  const y = Math.floor(Math.random() * (baseImage.height - srcImage.height));
  return baseImage.blit(srcImage, x, y);
}

/**
 * Scales an image to fit within the given dimensions while maintaining aspect ratio
 * @param image The image to scale
 * @param maxWidth Maximum width
 * @param maxHeight Maximum height
 * @returns The scaled image
 */
export function scaleImage(
  image: JimpImageLike,
  maxWidth: number,
  maxHeight: number,
): JimpImageLike {
  return image.scaleToFit(maxWidth, maxHeight);
}
