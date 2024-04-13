let Done = Symbol("retort-stream-done");
export default function createStreamCloner<T>(generator: AsyncGenerator<T>): () => AsyncGenerator<Awaited<T>> {

  let buffer: (Promise<T | typeof Done>)[] = [];
  async function iterate() {
    let resolve: (value: T | typeof Done) => void;
    let promise = new Promise<T | typeof Done>((r) => resolve = r);
    buffer.push(promise);
    for await (const chunk of generator) {
      resolve!(chunk)
      promise = new Promise<T | typeof Done>((r) => resolve = r);
      buffer.push(promise);
    }
    resolve!(Done);
  }

  iterate();

  return async function* getStream<T>() {
    for (let i = 0; i < buffer.length; i++) {
      let value = await buffer[i];
      if (value === Done) {
        return;
      }
      else {
        yield value as T;
      }
    }
  }

}
