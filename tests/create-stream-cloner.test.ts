import createStreamCloner from "../dist/create-stream-cloner";
import { describe, it, expect } from "vitest";

// Test for stream cloner
describe("createStreamCloner", () => {
  it("Should clone a stream", async () => {
    let stream = async function* () {
      yield "Hello";
      yield "World";
    };

    let cloner = createStreamCloner(stream());

    let cloned = cloner();

    expect(await cloned.next()).toEqual({ value: "Hello", done: false });
    expect(await cloned.next()).toEqual({ value: "World", done: false });
    expect(await cloned.next()).toEqual({ value: undefined, done: true });

    let cloned2 = cloner();

    expect(await cloned2.next()).toEqual({ value: "Hello", done: false });
    expect(await cloned2.next()).toEqual({ value: "World", done: false });
    expect(await cloned2.next()).toEqual({ value: undefined, done: true });
  });
});