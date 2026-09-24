import { useState, useEffect } from "react";

interface AvatarProps {
  src: string | null | undefined;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-3xl",
};

export default function Avatar({
  src,
  alt,
  size = "md",
  className = "",
}: AvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);

  // Reset failure state when the image source changes (e.g. after upload).
  useEffect(() => {
    setImgFailed(false);
  }, [src]);

  const initials = alt
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (src && !imgFailed) {
    // Backend stores images as base64 data URIs (data:image/...).
    // Use src directly — no /uploads/ prefix needed.
    return (
      <img
        src={src}
        alt={alt}
        onError={() => setImgFailed(true)}
        className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-accent/20 font-semibold text-accent ${sizeClasses[size]} ${className}`}
      aria-label={alt}
    >
      {initials}
    </div>
  );
}
