const base = new ArrayBuffer(4),
    i8 = new Uint8Array(base),
    u32 = new Int32Array(base),
    f32 = new Float32Array(base);

const Writer = class {
    constructor(length = 4096) {
        this.at = 0, this.buffer = new Uint8Array(length);
        this.UTF8Encoder = new TextEncoder();
    }

    string(str) {
        const bytes = this.UTF8Encoder.encode(str);
        this.buffer.set(bytes, this.at);
        this.at += bytes.length;
        this.buffer[this.at++] = 0;

        return this;
    }

    i8(number) {
        this.buffer[this.at++] = number;
        return this;
    }
    
    u32(number) {
        // console.trace(number);

        u32[0] = number;
        this.buffer.set(i8, this.at);
        this.at += 4;

        return this; 
    }

    f32(number) {
        f32[0] = number;
        this.buffer.set(i8, this.at);
        this.at += 4;

        return this;
    }

    out() {
        return this.buffer.subarray(0, this.at);
    }
}

const Reader = class  {
    constructor(buffer) {
        this.at = 0, this.buffer = buffer;
        this.UTF8Decoder = new TextDecoder();
    }

    string() {
        const start = this.at;
        while (this.buffer[this.at]) this.at++;
        return this.UTF8Decoder.decode(this.buffer.subarray(start, this.at++));
    }

    i8() { return this.buffer[this.at++]; }

    u32() {
        i8.set(this.buffer.subarray(this.at, this.at += 4));
        return u32[0];
    }

    f32() {
        i8.set(this.buffer.subarray(this.at, this.at += 4));
        return f32[0];
    }
}

module.exports = { Reader, Writer };