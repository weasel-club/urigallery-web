import Img from "@/components/img";
import { Image } from "@/data/image";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export function ImageDialog({
  image,
  open,
  onOpenChange,
  placeholder,
}: {
  image: Image | null;
  placeholder?: Blob;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="fixed inset-0 bg-black/80 flex items-center justify-center p-4"
      >
        <DialogTitle className="hidden"></DialogTitle>
        <div className="h-full">
          {image && (
            <Img
              className="h-full object-contain"
              name={image.name}
              path={image.path}
              placeholder={placeholder}
            />
          )}
        </div>
        <button
          className="absolute right-4 top-4 text-white"
          onClick={() => onOpenChange(false)}
        >
          <X></X>
        </button>
      </DialogContent>
    </Dialog>
  );
}
