import { errorSchema } from "@/api";
import { Binary } from "@/binary";
import {
  Chunk,
  End,
  Header,
  Heartbeat,
  Payload,
  Response,
} from "@/peer/message";
import { signalClient } from "@/signal/client";
import { randomBytes } from "crypto";
import { encode } from "msgpackr";
import SimplePeer from "simple-peer";
import { PassThrough } from "stream";
import { z } from "zod";
import { create } from "zustand";

type Channel = {
  peer: SimplePeer.Instance | null;
  connected: boolean;
  request: (type: string, data?: any) => Promise<Response>;
  connect: () => Promise<void>;
};

export const useChannel = create<Channel>((set, get) => {
  if (typeof window === "undefined") {
    return {
      peer: null,
      connected: false,
      request: async () => {
        throw new Error("Not supported on server");
      },
      connect: async () => {
        throw new Error("Not supported on server");
      },
    };
  }

  const request = async (
    peer: SimplePeer.Instance | null,
    type: string,
    data?: any
  ): Promise<Response> => {
    if (!peer) {
      throw new Error("Not connected");
    }

    const requestId = randomBytes(4).readUInt32LE(0);
    const payloadStream = new PassThrough({ objectMode: true });

    const peerListener = (data: Uint8Array) => {
      try {
        const binary = Binary.from(data);
        binary.readU8();
        const id = binary.readU32();
        if (id === requestId) {
          payloadStream.push(Payload.decode(data));
        }
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        process.nextTick(() => (payloadStream as any).emit("error", err));
      }
    };

    peer.on("data", peerListener);

    let dataStream: PassThrough | undefined;

    try {
      // Send request
      const typeBuffer = Buffer.from(type, "utf-8");
      const typeHeader = Buffer.concat([
        Buffer.from([typeBuffer.length]),
        typeBuffer,
      ]);
      const requestBuffer = data
        ? Buffer.concat([typeHeader, encode(data)])
        : typeHeader;
      peer.send(
        new Header(requestId, true, BigInt(requestBuffer.length)).encode()
      );
      peer.send(new Chunk(requestId, requestBuffer).encode());
      peer.send(new End(requestId).encode());

      // Await Header
      const header = await new Promise<Header>((resolve, reject) => {
        const onReadable = () => {
          const payload = payloadStream.read(1);
          if (payload instanceof Header) {
            payloadStream.off("readable", onReadable);
            resolve(payload);
          } else {
            payloadStream.off("readable", onReadable);
            reject(
              new Error(
                `[Req ${requestId}] Expected Header, got ${
                  payload ? payload.constructor.name : "nothing"
                }`
              )
            );
          }
        };
        payloadStream.on("readable", onReadable);
      });

      dataStream = new PassThrough();

      (async () => {
        const stream = dataStream;
        for await (const payload of payloadStream) {
          if (payload instanceof Chunk) {
            stream.push(payload.data);
          } else if (payload instanceof End) {
            setTimeout(() => {
              stream.end();
            }, 0);
            peer.off("data", peerListener);
            break;
          }
        }
      })();

      if (!header) {
        throw new Error(`[Req ${requestId}] No header received`);
      }

      return new Response(
        requestId,
        header.hasLength,
        header.length,
        dataStream
      );
    } catch (error: unknown) {
      peer.off("data", peerListener);
      if (dataStream) {
        dataStream.destroy(
          error instanceof Error ? error : new Error(String(error))
        );
      }
      throw error instanceof Error ? error : new Error(String(error));
    }
  };

  const connect = async () => {
    const peer = new SimplePeer({
      initiator: true,
      trickle: false,
      channelConfig: {
        ordered: true,
      },
      config: {
        iceServers: [
          {
            urls: "stun:stun.l.google.com:19302",
          },
        ],
      },
    });

    peer.setMaxListeners(0);

    peer.once("close", () => {
      set({ peer: null, connected: false });
    });

    const sdp = await new Promise<string>((resolve, reject) => {
      peer.on("signal", (data) => {
        if (data.type === "offer") {
          if (data.sdp) {
            resolve(data.sdp);
          } else {
            reject(new Error("No SDP"));
          }
        }
      });
    });

    const res = await signalClient.sessions.connections
      .$post({
        json: {
          sdp,
        },
      })
      .then((res) => res.json());

    if (res.type === "error") {
      throw new Error(res.error);
    }

    peer.signal({
      type: "answer",
      sdp: res.data.sdp,
    });

    peer.on("error", (e) => {
      console.error(e);
    });

    await new Promise<void>((resolve) => {
      peer.on("connect", () => {
        resolve();
      });
    });

    const versionResponse = await request(peer, "getVersion");
    const code = await versionResponse.code();
    if (code > 0) {
      const error = await versionResponse.object(errorSchema);
      throw new Error(error.error);
    }

    const { version } = await versionResponse.object(
      z.object({
        version: z.number(),
      })
    );

    console.log(`version: ${version}`);

    set({ peer, connected: true });

    // Start heartbeat
    const heartbeat = setInterval(() => {
      peer.send(new Heartbeat().encode());
    }, 10 * 1000);

    peer.once("close", () => {
      clearInterval(heartbeat);
    });
  };

  return {
    peer: null,
    connected: false,
    connect,
    request: (type, data) => request(get().peer, type, data),
  };
});
