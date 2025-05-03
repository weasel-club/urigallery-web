"use client";

import Container from "@/components/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/signal/auth";
import { signalClient } from "@/signal/client";
import { Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function Auth() {
  const [code, setCode] = useState("");
  const { setToken, token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (token) {
      router.push("/");
    }
  }, [token, router]);

  const connect = useCallback(async () => {
    try {
      const res = await signalClient.auth
        .$post({ json: { otp: code } })
        .then((res) => res.json());
      if (res.type === "success") {
        setToken(res.data.token);
        router.push("/");
      } else {
        toast.error(res.error);
      }
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
        console.error(e);
      } else {
        toast.error("Something went wrong");
      }
    }
  }, [code]);

  return (
    <Container className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">UriGallery</h1>

      <div className="w-full max-w-sm flex flex-col gap-2">
        <Button onClick={() => router.push("/download")}>
          <Download className="size-4" />
          Download PC Client
        </Button>
        <div className="flex flex-row gap-2">
          <Input
            type="text"
            placeholder="Enter your code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Button onClick={connect}>Connect</Button>
        </div>
      </div>
    </Container>
  );
}
