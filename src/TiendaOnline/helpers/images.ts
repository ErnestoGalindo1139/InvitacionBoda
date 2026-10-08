import { imageVariants } from '../data/imageVariants';
import { assetUrl } from './invitacion';

export function imageUrl(path: string, width = 1600): string {
  const variants = imageVariants[path.replace(/^\//, '')];
  const variant =
    variants?.find((item) => item.width >= width) ??
    variants?.[variants.length - 1];
  return assetUrl(variant?.src ?? path);
}

export function imageProps(path: string): { src: string; srcSet?: string } {
  const variants = imageVariants[path.replace(/^\//, '')];
  return {
    src: imageUrl(path),
    srcSet: variants
      ?.map((variant) => `${assetUrl(variant.src)} ${variant.width}w`)
      .join(', '),
  };
}

export function galleryImageSizes(path: string): string {
  const variants = imageVariants[path.replace(/^\//, '')];
  const largest = variants?.[variants.length - 1];
  // A landscape photo must cover the taller 3:4 gallery frame, so its
  // rendered source width is larger than the visible width of the frame.
  const scale = largest
    ? Math.max(1, largest.width / largest.height / (3 / 4))
    : 1;
  return `(min-width: 1130px) ${Math.ceil(350 * scale)}px, (min-width: 768px) ${Math.ceil(33 * scale)}vw, ${Math.ceil(82 * scale)}vw`;
}
