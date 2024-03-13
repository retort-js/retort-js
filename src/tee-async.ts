const AsyncIteratorProto = Object.getPrototypeOf(
  Object.getPrototypeOf(async function* () {}.prototype)
);
export default function teeAsync(iterable: any) {
  const iterator = iterable[Symbol.asyncIterator]();

  const buffers = [[], []];

  function makeIterator(buffer: any, i: any) {
    return Object.assign(Object.create(AsyncIteratorProto), {
      next() {
        if (!buffer) return Promise.resolve({ done: true, value: undefined });
        if (buffer.length) return buffer.shift();
        const res = iterator.next();
        if (buffers[i ^ 1]) (buffers[i ^ 1] as any[])?.push(res); // Add type annotation
        return res;
      },
      async return() {
        if (buffer) {
          buffer = buffers[i] = null as any;
          if (!buffers[i ^ 1]) await iterator.return();
        }
        return { done: true, value: undefined };
      },
    });
  }
  return buffers.map(makeIterator) as any[];
}
