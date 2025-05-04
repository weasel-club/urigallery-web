import { errorSchema } from "@/api";
import ImageGroup from "@/app/(main)/image-group";
import { ImageDialog } from "@/components/image-dialog";
import { Image, imageSchema } from "@/data/image";
import { useChannel } from "@/peer/connection";
import moment from "moment";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

export default function Gallery() {
  const channel = useChannel();

  const [images, setImages] = useState<Image[]>([]);

  const loadImages = useCallback(async () => {
    const response = await channel.request("listImages");

    const code = await response.code();
    if (code > 0) {
      const error = await response.object(errorSchema);
      console.log(error);

      toast.error(error.error);
      return;
    }

    const { images } = await response.object(
      z.object({
        images: z.array(imageSchema),
      })
    );

    setImages(images.sort((a, b) => b.createdAt - a.createdAt));
  }, [channel]);

  const groupImagesByDate = (images: Image[]) => {
    const map = new Map<string, Image[]>();
    for (const image of images) {
      const date = moment(image.createdAt);
      let key: string;
      if (date.isBefore(moment().subtract(1, "month"))) {
        key = date.format("YYYY-MM");
      } else if (date.isBefore(moment().subtract(1, "day"))) {
        key = date.format("YYYY-MM-DD");
      } else {
        key = "Today";
      }

      map.set(key, [...(map.get(key) || []), image]);
    }

    return map;
  };

  const imagesByDate = useMemo(() => groupImagesByDate(images), [images]);
  const [showingImageKeys, setShowingImageKeys] = useState<number>(1);
  const showingImages = useMemo(
    () => Array.from(imagesByDate.entries()).slice(0, showingImageKeys),
    [imagesByDate, showingImageKeys]
  );

  const [displayingImage, setDisplayingImage] = useState<Image | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  useEffect(() => {
    if (channel.connected) {
      loadImages();
    }
  }, [channel.connected, loadImages]);

  return (
    images.length > 0 && (
      <div>
        <ImageDialog
          image={displayingImage}
          images={images}
          open={imageDialogOpen}
          onOpenChange={setImageDialogOpen}
        />

        {showingImages.map(([key, images], i) => (
          <ImageGroup
            key={key}
            title={key}
            images={images}
            onVisible={() => {
              if (showingImageKeys < i + 2) {
                setShowingImageKeys(i + 2);
              }
            }}
            onImageClick={(image) => {
              setDisplayingImage(image);
              setImageDialogOpen(true);
            }}
          />
        ))}
      </div>
    )
  );
}
