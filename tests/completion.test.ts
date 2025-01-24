import { describe, it, expect } from "vitest";
import { claudeChatCompletion } from "../src/claude-chat-completion";
import { openAiChatCompletion } from "../src/openai-chat-completion";
import { RetortMessage } from "../src/message";
import { RetortSettings } from "../src/agent";

const MATH_PROMPT = "2 + 2 = ? (Just say the number digit, say nothing but the number digit, not even the full stop. )";

describe("Chat Completions", () => {
  const messages = [Promise.resolve(new RetortMessage({
    role: "user",
    content: MATH_PROMPT
  }))];

  describe("Claude", () => {
    const settings: RetortSettings = {
      model: "claude-3-5-haiku-latest",
      temperature: 0,
      topP: 1
    };

    it("should work with explicit streaming", async () => {
      const completion = claudeChatCompletion({ ...settings, stream: true }, messages);
      let lastChunk;
      for await (const chunk of completion) {
        lastChunk = chunk;
      }
      expect(lastChunk?.content.trim()).toBe("4");
    });

    it("should work with default non-streaming", async () => {
      const completion = claudeChatCompletion({ ...settings }, messages);
      let lastChunk;
      for await (const chunk of completion) {
        lastChunk = chunk;
      }
      expect(lastChunk?.content.trim()).toBe("4");
    });
  });

  describe("OpenAI", () => {
    const settings: RetortSettings = {
      model: "gpt-4o-mini",
      temperature: 0,
      topP: 1
    };

    it("should work with explicit streaming", async () => {
      const completion = openAiChatCompletion({ ...settings, stream: true }, messages);
      let lastChunk;
      for await (const chunk of completion) {
        lastChunk = chunk;
      }
      expect(lastChunk?.content.trim()).toBe("4");
    });

    it("should work with default non-streaming", async () => {
      const completion = openAiChatCompletion({ ...settings }, messages);
      let lastChunk;
      for await (const chunk of completion) {
        lastChunk = chunk;
      }
      expect(lastChunk?.content.trim()).toBe("4");
    });
  });
});
