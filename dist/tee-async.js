"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AsyncIteratorProto = Object.getPrototypeOf(Object.getPrototypeOf(async function* () { }.prototype));
function teeAsync(iterable) {
    const iterator = iterable[Symbol.asyncIterator]();
    const buffers = [[], []];
    function makeIterator(buffer, i) {
        return Object.assign(Object.create(AsyncIteratorProto), {
            next() {
                if (!buffer)
                    return Promise.resolve({ done: true, value: undefined });
                if (buffer.length)
                    return buffer.shift();
                const res = iterator.next();
                if (buffers[i ^ 1])
                    buffers[i ^ 1]?.push(res); // Add type annotation
                return res;
            },
            async return() {
                if (buffer) {
                    buffer = buffers[i] = null;
                    if (!buffers[i ^ 1])
                        await iterator.return();
                }
                return { done: true, value: undefined };
            },
        });
    }
    return buffers.map(makeIterator);
}
exports.default = teeAsync;
