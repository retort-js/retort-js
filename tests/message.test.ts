import { describe, it, expect, beforeEach, vi } from "vitest";
import { createTemplateTag, Message } from "../src/message";
import { RetortConfiguration } from "../src/agent";

describe("createTemplateTag", () => {
  let settings: RetortConfiguration;

  beforeEach(() => {
    settings = {
      model: "gpt-3.5-turbo",
      role: "user",
      provider: "openai",
      action: "generation",
    };
  });

  it("should return a function", () => {
    const result = createTemplateTag(settings);
    expect(typeof result).toBe("function");
  });

  it("should return a Message instance when the returned function is called", () => {
    const templateTag = createTemplateTag(settings);
    const message = templateTag`Hello, world!`;
    expect(message).toBeInstanceOf(Message);
  });

  it("should correctly interpolate values into the template string", () => {
    const templateTag = createTemplateTag(settings);
    const name = "world";
    const message = templateTag`Hello, ${name}!`;
    expect(message.content).toBe("Hello, world!");
  });

  it("should correctly remove carriage returns from the template string", () => {
    const templateTag = createTemplateTag(settings);
    const message = templateTag`Hello,\rworld!`;
    expect(message.content).toBe("Hello,world!");
  });

  it("should correctly remove leading and trailing whitespace from the template string", () => {
    const templateTag = createTemplateTag(settings);
    const message = templateTag`   Hello, world!   `;
    expect(message.content).toBe("Hello, world!");
  });

  it("should correctly remove whitespace at the start of a line in the template string", () => {
    const templateTag = createTemplateTag(settings);
    const message = templateTag`  Hello, world!`;
    expect(message.content).toBe("Hello, world!");
  });

  it("should correctly remove whitespace at the end of a line in the template string", () => {
    const templateTag = createTemplateTag(settings);
    const message = templateTag`Hello, world!    `;
    expect(message.content).toBe("Hello, world!");
  });
});
