"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/signal/auth";
import { signalClient } from "@/signal/client";
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
    <div className="flex flex-col items-center justify-center max-w-sm mx-auto h-screen">
      <h1 className="mb-4">UriGallery</h1>

      <div className="w-full grid grid-cols-[1fr_auto] gap-2">
        <Input
          type="text"
          placeholder="Enter your code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <Button onClick={connect}>Connect</Button>
      </div>
    </div>
  );
}
