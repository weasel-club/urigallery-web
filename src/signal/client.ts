import { App } from "@/signal/api";
import { useAuthStore } from "@/signal/auth";
import { hc } from "hono/client";

export const signalClient = hc<App>(process.env.NEXT_PUBLIC_SIGNAL_API_URL!, {
  headers() {
    return {
      Authorization: `Bearer ${useAuthStore.getState().token}`,
    };
  },
});
