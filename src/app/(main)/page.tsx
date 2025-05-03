"use client";

import Images from "@/app/(main)/images";
import Container from "@/components/container";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useChannel } from "@/peer/connection";
import { useAuthStore } from "@/signal/auth";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function Home() {
  const { token, clearToken } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const channel = useChannel();

  const [connectionError, setConnectionError] = useState<string | null>(null);
  useEffect(() => {
    if (!token) {
      router.push("/auth");
    }
  }, [token, router]);

  const connect = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      await channel.connect();
    } catch (e) {
      if (e instanceof Error) {
        setConnectionError(e.message);
        console.error(e);
      } else {
        setConnectionError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }, [channel, token]);

  useEffect(() => {
    connect();
  }, []);

  return (
    <Container className="flex flex-col items-stretch justify-center min-h-screen py-2">
      {loading ? (
        <div>
          <Spinner />
        </div>
      ) : connectionError ? (
        <div className="flex flex-col items-center justify-center">
          <p className="text-red-500 mb-2">{connectionError}</p>
          <div className="flex flex-row gap-2">
            <Button
              onClick={() => {
                connect();
                setConnectionError(null);
              }}
            >
              Retry
            </Button>
            <Button onClick={() => clearToken()}>Disconnect</Button>
          </div>
        </div>
      ) : (
        <Images />
      )}
    </Container>
  );
}
