import {run} from "../dist/run";
import { describe, it, expect } from "vitest";

describe("run", () => {
  it("Run functions should work", async () => {
    expect(await run(async () => "TEST")).toBe("TEST");
  });

});
