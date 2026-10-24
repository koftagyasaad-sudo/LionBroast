"use client";

import { useState } from "react";
import { pickFallback } from "@/lib/img";
import { cn } from "@/lib/utils";

export default function ItemImage({
  id,
  src,
  alt,
  className,
}: {
  id: string;
  src?: string | null;
  alt: string;
  className?: string;
}) {
  const fallback = pickFallback(id);
  const [current, setCurrent] = useState(src || fallback);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={current}
      alt={alt}
      loading="lazy"
      onError={() => current !== fallback && setCurrent(fallback)}
      className={cn("h-full w-full object-cover", className)}
    />
  );
}
