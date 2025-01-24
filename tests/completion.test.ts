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
      model: "claude-3-haiku-20240307",
      temperature: 0,
      topP: 1
    };

    it("should work with streaming", async () => {
      const completion = claudeChatCompletion({ ...settings, stream: true }, messages);
      let lastChunk;
      for await (const chunk of completion) {
        lastChunk = chunk;
      }
      expect(lastChunk?.content.trim()).toBe("4");
    });

    it("should work without streaming", async () => {
      const completion = claudeChatCompletion({ ...settings, stream: false }, messages);
      let lastChunk;
      for await (const chunk of completion) {
        lastChunk = chunk;
      }
      expect(lastChunk?.content.trim()).toBe("4");
    });
  });

  describe("OpenAI", () => {
    const settings: RetortSettings = {
      model: "gpt-3.5-turbo",
      temperature: 0,
      topP: 1
    };

    it("should work with streaming", async () => {
      const completion = openAiChatCompletion({ ...settings, stream: true }, messages);
      let lastChunk;
      for await (const chunk of completion) {
        lastChunk = chunk;
      }
      expect(lastChunk?.content.trim()).toBe("4");
    });

    it("should work without streaming", async () => {
      const completion = openAiChatCompletion({ ...settings, stream: false }, messages);
      let lastChunk;
      for await (const chunk of completion) {
        lastChunk = chunk;
      }
      expect(lastChunk?.content.trim()).toBe("4");
    });
  });
});
