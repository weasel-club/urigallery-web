import { errorSchema } from "@/api";
import { cn } from "@/lib/utils";
import { useChannel } from "@/peer/connection";
import { useEffect, useMemo, useState } from "react";
import { useIntersectionObserver } from "usehooks-ts";

export default function Img({
  path,
  name,
  className,
  size,
  placeholder,
  onClick,
  onLoad,
}: {
  path: string;
  name: string;
  className?: string;
  size?: number;
  placeholder?: Blob;
  onClick?: () => void;
  onLoad?: (blob: Blob) => void;
}) {
  const [image, setImage] = useState<Blob | null>(null);
  const [loadStarted, setLoadStarted] = useState(false);
  const channel = useChannel();

  const { ref, isIntersecting } = useIntersectionObserver({
    rootMargin: "0px",
    threshold: 0.1,
  });

  const loadImage = async (size?: number) => {
    const response = await channel.request("downloadImage", {
      path,
      resize: size ?? null,
    });

    const code = await response.code();
    if (code > 0) {
      const { error } = await response.object(errorSchema);
      throw new Error(`Failed to download image: ${error}`);
    }

    const buffer = await response.buffer();
    return new Blob([buffer], { type: "image/png" });
  };

  useEffect(() => {
    (async () => {
      if (!isIntersecting || loadStarted) return;
      setLoadStarted(true);
      const image = await loadImage(size ? Math.floor(size * 1.5) : undefined);
      setImage(image);
      onLoad?.(image);
    })();
  }, [path, channel, isIntersecting, loadStarted]);

  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (image) {
      const url = URL.createObjectURL(image);
      setUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else if (placeholder) {
      const url = URL.createObjectURL(placeholder);
      setUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [image, placeholder]);

  const urlToShow = useMemo(() => {
    return url ?? placeholder;
  }, [url, placeholder]);

  return urlToShow ? (
    <img
      ref={ref}
      className={className}
      src={urlToShow}
      onClick={onClick}
      alt={name}
    />
  ) : (
    <div ref={ref} className={cn("bg-gray-100", className)}></div>
  );
}
