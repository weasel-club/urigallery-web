"use client";

import Gallery from "@/app/(main)/gallery";
import Container from "@/components/container";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useChannel } from "@/peer/connection";
import { useAuthStore } from "@/signal/auth";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function Home() {
  const { token, setToken, clearToken } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const channel = useChannel();

  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      const savedToken = window.localStorage.getItem("token");
      if (savedToken) {
        setToken(savedToken);
      } else {
        router.push("/auth");
      }
    }
  }, [token, setToken, router]);

  const connect = useCallback(async () => {
    if (!token || channel.connected) return;
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
  }, [token, channel.connected]);

  useEffect(() => {
    connect();
  }, [connect]);

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
            <Button
              onClick={() => {
                clearToken();
                channel.disconnect();
              }}
            >
              Disconnect
            </Button>
          </div>
        </div>
      ) : (
        <Gallery />
      )}
    </Container>
  );
}
