import Img from "@/components/img";
import { Image } from "@/data/image";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { Download, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function ImageDialog({
  image,
  images,
  open,
  onOpenChange,
}: {
  image: Image | null;
  images: Image[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [currentImage, setCurrentImage] = useState<Image | null>(image);
  const [currentImageBlob, setCurrentImageBlob] = useState<Blob | null>(null);

  useEffect(() => {
    if (open) {
      if (image !== currentImage) {
        setCurrentImage(image);
      }
    }
  }, [open, image]);

  const index = useMemo(
    () => images.findIndex((i) => i.path === currentImage?.path),
    [images, currentImage]
  );

  const previewingImages = useMemo(() => {
    if (!open) return [];
    const start = Math.max(0, index - 2);
    const end = Math.min(images.length, index + 3);
    return images.slice(start, end);
  }, [images, index, open]);

  const dialogRef = useRef<HTMLDivElement>(null);

  const nextImage = useCallback(() => {
    if (index === images.length - 1) return;
    setCurrentImage(images[index + 1]);
  }, [images, index]);

  const previousImage = useCallback(() => {
    if (index === 0) return;
    setCurrentImage(images[index - 1]);
  }, [images, index]);

  const nextImageElement = useRef<HTMLDivElement>(null);
  const previousImageElement = useRef<HTMLDivElement>(null);
  const [imageX, setImageX] = useState(0);
  const [imageY, setImageY] = useState(0);

  useEffect(() => {
    if (dialogRef.current) {
      const onKeydown = (e: KeyboardEvent) => {
        if (e.key === "ArrowRight") nextImage();
        if (e.key === "ArrowLeft") previousImage();
      };

      let clicking = false;
      let clickStartX = 0;
      let clickStartY = 0;
      let draggingX = false;
      let draggingY = false;

      const onClickStart = (e: MouseEvent) => {
        clicking = true;
        clickStartX = e.clientX;
        clickStartY = e.clientY;
      };

      const onClickMove = (e: MouseEvent) => {
        if (!clicking) return;
        const deltaX = e.clientX - clickStartX;
        const deltaY = e.clientY - clickStartY;
        if (!draggingY && Math.abs(deltaX) > 10) {
          draggingX = true;
          setImageX(deltaX / 2);
        }
        if (!draggingX && deltaY < -10) {
          draggingY = true;
          setImageY(deltaY / 2);
        }
      };

      const onClickEnd = (e: MouseEvent) => {
        clicking = false;
        const deltaX = e.clientX - clickStartX;
        const deltaY = e.clientY - clickStartY;

        if (draggingX && deltaX > 10) previousImage();
        if (draggingX && deltaX < -10) nextImage();
        if (draggingY && deltaY < -10) onOpenChange(false);
        setImageX(0);
        setImageY(0);
      };

      dialogRef.current.addEventListener("keydown", onKeydown);
      dialogRef.current.addEventListener("mousedown", onClickStart);
      dialogRef.current.addEventListener("mousemove", onClickMove);
      dialogRef.current.addEventListener("mouseup", onClickEnd);
      return () => {
        dialogRef.current?.removeEventListener("keydown", onKeydown);
        dialogRef.current?.removeEventListener("mousedown", onClickStart);
        dialogRef.current?.removeEventListener("mousemove", onClickMove);
        dialogRef.current?.removeEventListener("mouseup", onClickEnd);
      };
    }
  }, [dialogRef.current, nextImage, previousImage]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={dialogRef}
        aria-describedby={undefined}
        className="fixed inset-0
         bg-black/80 backdrop-blur transition animate-in fade-in-0
         flex items-center justify-center"
      >
        <DialogTitle className="hidden"></DialogTitle>
        <div className="w-full h-full pointer-events-none">
          <div
            className="w-calc(100%-2rem) h-[calc(100%-2rem-8rem)] absolute z-10 top-8 left-4 right-4"
            style={{
              transform: `translateX(${imageX}px) translateY(${imageY}px)`,
            }}
          >
            {currentImage && (
              <Img
                className="w-full h-full object-contain"
                name={currentImage.name}
                path={currentImage.path}
                onLoad={(blob) => setCurrentImageBlob(blob)}
              />
            )}
          </div>

          <div className="h-64 z-0 flex items-end absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent">
            <div className="w-full h-[8rem] text-white text-sm flex flex-col gap-2 justify-center p-2">
              <div className="flex flex-row items-center justify-center">
                {index + 1}/{images.length}
              </div>
              <div className="flex flex-row gap-2 items-center justify-center">
                {previewingImages.map((i) => (
                  <Img
                    key={`preview-${i.path}`}
                    className={cn(
                      "size-16 object-cover rounded transition",
                      i === currentImage && "scale-110"
                    )}
                    name={i.name}
                    path={i.path}
                    size={450}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="absolute right-4 top-4 flex flex-row gap-2">
          <button
            className="text-white"
            onClick={() => {
              if (!currentImageBlob) return;
              const a = document.createElement("a");
              a.href = URL.createObjectURL(currentImageBlob);
              a.download = currentImage?.name ?? "image.png";
              a.click();
              URL.revokeObjectURL(a.href);
            }}
          >
            <Download />
          </button>
          <button className="text-white" onClick={() => onOpenChange(false)}>
            <X></X>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
