import { Binary } from "@/binary";
import { decode } from "msgpackr";
import { PassThrough } from "stream";
import { z } from "zod";
const PAYLOAD_TYPES = {
  HEADER: 1,
  CHUNK: 2,
  END: 3,
  HEARTBEAT: 4,
};

export abstract class Payload {
  abstract encode(): Uint8Array;

  public static decode(buffer: Uint8Array): Payload {
    const binary = Binary.from(buffer);
    const type = binary.readU8();
    if (type === PAYLOAD_TYPES.HEADER) {
      return Header.decode(buffer);
    } else if (type === PAYLOAD_TYPES.CHUNK) {
      return Chunk.decode(buffer);
    } else if (type === PAYLOAD_TYPES.END) {
      return End.decode(buffer);
    } else if (type === PAYLOAD_TYPES.HEARTBEAT) {
      return Heartbeat.decode(buffer);
    }
    throw new Error("Invalid payload type");
  }
}

export abstract class RPCPayload extends Payload {
  #id: number;
  constructor(id: number) {
    super();
    this.#id = id;
  }

  public get id() {
    return this.#id;
  }

  protected set id(id: number) {
    this.#id = id;
  }
}

export class Header extends RPCPayload {
  #hasLength: boolean;
  #length: bigint;
  constructor(id: number, hasLength: boolean, length: bigint) {
    super(id);
    this.#hasLength = hasLength;
    this.#length = length;
  }

  override encode(): Uint8Array {
    const binary = Binary.allocate(14);
    binary.writeU8(PAYLOAD_TYPES.HEADER);
    binary.writeU32(this.id);
    binary.writeU8(this.#hasLength ? 1 : 0);
    binary.writeU64(this.#length);
    return binary.buffer();
  }

  public static decode(buffer: Uint8Array): Header {
    const binary = Binary.from(buffer);
    const type = binary.readU8();
    if (type !== PAYLOAD_TYPES.HEADER) {
      throw new Error("Invalid payload type");
    }
    const id = binary.readU32();
    const hasLength = binary.readU8() === 1;
    const length = hasLength ? binary.readU64() : BigInt(0);
    return new Header(id, hasLength, length);
  }

  public get hasLength() {
    return this.#hasLength;
  }

  public get length() {
    return this.#length;
  }
}

export class Chunk extends RPCPayload {
  #data: Uint8Array;
  constructor(id: number, data: Uint8Array) {
    super(id);
    this.#data = data;
  }

  override encode(): Uint8Array {
    const binary = Binary.allocate(5 + this.data.length);
    binary.writeU8(PAYLOAD_TYPES.CHUNK);
    binary.writeU32(this.id);
    binary.writeBytes(this.data);
    return binary.buffer();
  }

  public static decode(buffer: Uint8Array): Chunk {
    const binary = Binary.from(buffer);
    const type = binary.readU8();
    if (type !== PAYLOAD_TYPES.CHUNK) {
      throw new Error("Invalid payload type");
    }
    const id = binary.readU32();
    const data = binary.readToEnd();
    return new Chunk(id, data);
  }

  public get data() {
    return this.#data;
  }
}

export class End extends RPCPayload {
  constructor(id: number) {
    super(id);
  }

  override encode(): Uint8Array {
    const binary = Binary.allocate(5);
    binary.writeU8(PAYLOAD_TYPES.END);
    binary.writeU32(this.id);
    return binary.buffer();
  }

  public static decode(buffer: Uint8Array): End {
    const binary = Binary.from(buffer);
    const type = binary.readU8();
    if (type !== PAYLOAD_TYPES.END) {
      throw new Error("Invalid payload type");
    }
    const id = binary.readU32();
    return new End(id);
  }
}

export class Heartbeat extends Payload {
  override encode(): Uint8Array {
    const binary = Binary.allocate(5);
    binary.writeU8(PAYLOAD_TYPES.HEARTBEAT);
    return binary.buffer();
  }

  public static decode(buffer: Uint8Array): Heartbeat {
    const binary = Binary.from(buffer);
    const type = binary.readU8();
    if (type !== PAYLOAD_TYPES.HEARTBEAT) {
      throw new Error("Invalid payload type");
    }
    return new Heartbeat();
  }
}

export class Response {
  #id: number;
  #hasLength: boolean;
  #length: bigint;
  #stream: PassThrough;
  #offset: number;

  constructor(
    id: number,
    hasLength: boolean,
    length: bigint,
    stream: PassThrough
  ) {
    this.#id = id;
    this.#hasLength = hasLength;
    this.#length = length;
    this.#stream = stream;
    this.#offset = 0;
  }

  public get hasLength() {
    return this.#hasLength;
  }

  public get length() {
    return this.#length;
  }

  public get stream() {
    return this.#stream;
  }

  public async *[Symbol.asyncIterator](): AsyncGenerator<Uint8Array> {
    for await (const chunk of this.#stream) {
      yield chunk;
    }
  }

  private async read(size?: number): Promise<Uint8Array> {
    size = size ?? (this.#hasLength ? Number(this.#length) : undefined);
    let buffer = Buffer.alloc(0);
    await new Promise<void>((resolve, reject) => {
      const read = () => {
        while (this.#stream.readableLength > 0) {
          const chunk = this.#stream.read(
            size
              ? Math.min(size - this.#offset, this.#stream.readableLength)
              : undefined
          );

          if (chunk) {
            buffer = Buffer.concat([buffer, chunk]);
            this.#offset += chunk.length;
          } else {
            if (size && this.#offset !== size) {
              reject(new Error("Unexpected end of stream"));
              return;
            }
            clear();
            resolve();
            break;
          }

          if (size && this.#offset === size) {
            clear();
            resolve();
            break;
          }
        }
      };

      const onReadable = () => {
        read();
      };

      const onError = (err: Error) => {
        clear();
        reject(err);
      };

      const onEnd = () => {
        read();
        clear();
        resolve();
      };

      const clear = () => {
        this.#stream.off("readable", onReadable);
        this.#stream.off("error", onError);
        this.#stream.off("finish", onEnd);
      };

      this.#stream.on("readable", onReadable);
      this.#stream.on("error", onError);
      this.#stream.on("finish", onEnd);

      read();
    });

    return buffer;
  }

  public async buffer(): Promise<Uint8Array> {
    return await this.read();
  }

  public async code(): Promise<number> {
    const buffer = await this.read(1);
    return buffer[0];
  }

  public async object<S extends z.ZodSchema>(schema: S): Promise<z.infer<S>> {
    return schema.parse(decode(await this.read()));
  }
}
