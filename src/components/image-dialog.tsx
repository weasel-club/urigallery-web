import Img from "@/components/img";
import { Image } from "@/data/image";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import commaNumber from "comma-number";
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
      let deltaX = 0;
      let deltaY = 0;

      const onClickStart = (e: MouseEvent | TouchEvent) => {
        clicking = true;
        clickStartX =
          e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
        clickStartY =
          e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
        deltaX = 0;
        deltaY = 0;
      };

      const onClickMove = (e: MouseEvent | TouchEvent) => {
        if (!clicking) return;
        deltaX =
          e instanceof MouseEvent
            ? e.clientX - clickStartX
            : e.touches[0].clientX - clickStartX;
        deltaY =
          e instanceof MouseEvent
            ? e.clientY - clickStartY
            : e.touches[0].clientY - clickStartY;
        if (!draggingY && Math.abs(deltaX) > 10) {
          draggingX = true;
          setImageX(deltaX / 2);
        }
        if (!draggingX && deltaY < -10) {
          draggingY = true;
          setImageY(deltaY / 2);
        }
      };

      const onClickEnd = () => {
        clicking = false;
        if (draggingX && deltaX > 10) previousImage();
        if (draggingX && deltaX < -10) nextImage();
        if (draggingY && deltaY < -10) onOpenChange(false);
        setImageX(0);
        setImageY(0);
      };

      dialogRef.current.addEventListener("keydown", onKeydown);
      dialogRef.current.addEventListener("mousedown", onClickStart);
      dialogRef.current.addEventListener("touchstart", onClickStart);
      dialogRef.current.addEventListener("mousemove", onClickMove);
      dialogRef.current.addEventListener("touchmove", onClickMove);
      dialogRef.current.addEventListener("mouseup", onClickEnd);
      dialogRef.current.addEventListener("touchend", onClickEnd);
      return () => {
        dialogRef.current?.removeEventListener("keydown", onKeydown);
        dialogRef.current?.removeEventListener("mousedown", onClickStart);
        dialogRef.current?.removeEventListener("touchstart", onClickStart);
        dialogRef.current?.removeEventListener("mousemove", onClickMove);
        dialogRef.current?.removeEventListener("touchmove", onClickMove);
        dialogRef.current?.removeEventListener("mouseup", onClickEnd);
        dialogRef.current?.removeEventListener("touchend", onClickEnd);
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
        <div className="w-full h-full">
          <div
            className="w-calc(100%-2rem) h-[calc(100%-3rem-8rem)] absolute z-10 top-12 left-4 right-4 pointer-events-none"
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

          <div className="h-64 z-0 flex items-end absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent ">
            <div className="w-full h-[8rem] text-white text-sm flex flex-col gap-2 justify-center p-2">
              <div className="flex flex-row items-center justify-center">
                {commaNumber(index + 1)}/{commaNumber(images.length)}
              </div>
              <div className="flex flex-row gap-2 items-center justify-center">
                {previewingImages.map((i) => (
                  <Img
                    key={`preview-${i.path}`}
                    className={cn(
                      "size-16 object-cover rounded",
                      i === currentImage && "scale-110"
                    )}
                    name={i.name}
                    path={i.path}
                    size={450}
                    onClick={() => {
                      setCurrentImage(i);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="absolute right-2 top-2 flex flex-row gap-2">
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
            <Download className="size-6" />
          </button>
          <button className="text-white" onClick={() => onOpenChange(false)}>
            <X className="size-6"></X>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
