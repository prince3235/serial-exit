import { fallbackSrc, srcSet, type MediaAsset } from "@/content/media";
import { cn } from "@/lib/utils";

/**
 * <picture> for optimized photo assets (AVIF → WebP → WebP fallback).
 * Always renders intrinsic width/height so the browser reserves space (no layout shift).
 * Images are decorative by default (alt=""): meaning is carried by real DOM text beside them.
 */
export function Picture({
  asset,
  sizes,
  alt = "",
  eager = false,
  className,
  imgClassName,
  style,
}: {
  asset: MediaAsset;
  sizes: string;
  alt?: string;
  eager?: boolean;
  className?: string;
  imgClassName?: string;
  style?: React.CSSProperties;
}) {
  return (
    <picture className={cn("block", className)}>
      <source type="image/avif" srcSet={srcSet(asset, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(asset, "webp")} sizes={sizes} />
      <img
        src={fallbackSrc(asset)}
        alt={alt}
        width={asset.width}
        height={asset.height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className={imgClassName}
        style={style}
      />
    </picture>
  );
}
