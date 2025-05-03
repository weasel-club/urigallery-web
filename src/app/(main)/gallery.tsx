import Img from "@/components/img";
import { Image } from "@/data/image";
import { cn } from "@/lib/utils";
import moment from "moment";
import { useEffect, useState } from "react";
import { useIntersectionObserver } from "usehooks-ts";

export default function Gallery({
  title,
  images,
  onVisible,
  onImageClick,
  onImageLoad,
}: {
  title: string;
  images: Image[];
  onVisible?: () => void;
  onImageClick?: (image: Image) => void;
  onImageLoad?: (image: Image, blob: Blob) => void;
}) {
  const { ref, isIntersecting } = useIntersectionObserver({
    rootMargin: "0px",
    threshold: 0.1,
  });
  const [onVisibleCalled, setOnVisibleCalled] = useState(false);

  useEffect(() => {
    if (onVisibleCalled) return;
    if (isIntersecting) {
      onVisible?.();
      setOnVisibleCalled(true);
    }
  }, [isIntersecting, onVisible, onVisibleCalled]);

  return (
    <div key={`image-group-${title}`} ref={ref}>
      <h3 className="text-lg font-black mb-2">{title}</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {images.map((image) => {
          const isToday = moment(image.createdAt).isAfter(
            moment().subtract(1, "day")
          );

          return (
            <div
              key={image.path}
              className={cn(
                "overflow-hidden rounded",
                isToday
                  ? "size-[calc(100%/3-0.5rem/3*2)] max-sm:size-[calc(100%/4-0.5rem/4*3)] aspect-square"
                  : "size-[calc(100%/4-0.5rem/4*3)] max-sm:size-[calc(100%/5-0.5rem/5*4)] aspect-square"
              )}
            >
              <Img
                path={image.path}
                name={image.name}
                size={isToday ? 500 : 300}
                className="object-cover object-center size-full"
                onClick={() => onImageClick?.(image)}
                onLoad={(blob) => onImageLoad?.(image, blob)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
