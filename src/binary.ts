export class Binary {
  private array: Uint8Array;
  private view: DataView;
  private offset: number = 0;

  private constructor(array: Uint8Array) {
    this.array = array;
    this.view = new DataView(this.array.buffer);
  }

  static from(array: Uint8Array): Binary {
    return new Binary(array);
  }

  static allocate(size: number): Binary {
    return new Binary(new Uint8Array(size));
  }

  public clear(): this {
    this.offset = 0;
    return this;
  }

  public readU8(): number {
    const value = this.view.getUint8(this.offset);
    this.offset += 1;
    return value;
  }

  public readU16(): number {
    const value = this.view.getUint16(this.offset);
    this.offset += 2;
    return value;
  }

  public readU32(): number {
    const value = this.view.getUint32(this.offset);
    this.offset += 4;
    return value;
  }

  public readU64(): bigint {
    const value = this.view.getBigUint64(this.offset);
    this.offset += 8;
    return value;
  }

  public readBytes(length: number): Uint8Array {
    const value = this.array.slice(this.offset, this.offset + length);
    this.offset += length;
    return value;
  }

  public readToEnd(): Uint8Array {
    return this.array.slice(this.offset);
  }

  public writeU8(value: number): this {
    this.view.setUint8(this.offset, value);
    this.offset += 1;
    return this;
  }

  public writeU16(value: number): this {
    this.view.setUint16(this.offset, value);
    this.offset += 2;
    return this;
  }

  public writeU32(value: number): this {
    this.view.setUint32(this.offset, value);
    this.offset += 4;
    return this;
  }

  public writeU64(value: bigint): this {
    this.view.setBigUint64(this.offset, value);
    this.offset += 8;
    return this;
  }

  public writeBytes(value: Uint8Array): this {
    this.array.set(value, this.offset);
    this.offset += value.length;
    return this;
  }

  public size() {
    return this.offset;
  }

  public buffer() {
    return this.array.slice(0, this.offset);
  }
}
