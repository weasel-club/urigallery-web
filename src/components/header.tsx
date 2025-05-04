"use client";

import Container from "@/components/container";
import { cn } from "@/lib/utils";
import { useChannel } from "@/peer/connection";
import { useAuthStore } from "@/signal/auth";
import { Download, Image, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { create } from "zustand";

function Button({
  className,
  children,
  onClick,
}: {
  className?: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "text-sm p-1 font-semibold hover:bg-gray-100 rounded cursor-pointer flex items-center gap-1",
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export const useHeaderSize = create<{
  height: number;
  setHeight: (height: number) => void;
}>((set) => ({
  height: 0,
  setHeight: (height: number) => set({ height }),
}));

export default function Header() {
  const { token, clearToken } = useAuthStore();
  const { disconnect } = useChannel();
  const router = useRouter();

  const { setHeight } = useHeaderSize();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const resizeObserver = new ResizeObserver(() => {
        setHeight(ref.current?.clientHeight || 0);
      });
      resizeObserver.observe(ref.current);
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [ref]);

  return (
    <Container className="flex gap-2 py-2" ref={ref}>
      <Button
        onClick={() => {
          router.push("/");
        }}
      >
        <Image className="size-4"></Image>
        UriGallery
      </Button>
      <div className="flex-1"></div>
      <Button
        className="max-sm:hidden"
        onClick={() => {
          router.push("/download");
        }}
      >
        <Download className="size-4" />
        Download PC Client
      </Button>
      {token && (
        <Button
          onClick={() => {
            clearToken();
            disconnect();
          }}
        >
          <LogOut className="size-4" />
          Disconnect
        </Button>
      )}
    </Container>
  );
}
