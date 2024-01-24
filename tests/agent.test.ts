import { describe, it, expect, beforeEach, vi } from "vitest";
import { agent, RetortConfiguration } from "../src/agent";
import { Conversation } from "../src/conversation";

describe("agent", () => {
  let conversation: Conversation;
  let settings: Partial<RetortConfiguration>;

  beforeEach(() => {
    conversation = new Conversation();
    settings = {
      model: "gpt-3.5-turbo",
      role: "user",
      provider: "openai",
      action: "generation",
    };
  });

  it("should return an agent with default settings when no input settings are provided", () => {
    const result = agent(conversation, {});

    expect(result.settings.model).toBe("gpt-3.5-turbo");
    expect(result.settings.role).toBe("user");
    expect(result.settings.provider).toBe("openai");
    expect(result.settings.action).toBe("generation");
  });

  it("should merge input settings with default settings", () => {
    const inputSettings: Partial<RetortConfiguration> = { model: "gpt-4" };
    const result = agent(conversation, inputSettings);

    expect(result.settings).toEqual({
      model: "gpt-4",
      role: "user",
      provider: "openai",
      action: "generation",
    });
  });

  it("should add a message to the conversation when a string is passed", () => {
    const agentInstance = agent(conversation, {});
    agentInstance("Hello, world!");
    expect(conversation.messages).toHaveLength(1);
    expect(conversation.messages[0]?.content).toBe("Hello, world!");
  });

  it("should add a message to the conversation when a template string is passed", () => {
    const agentInstance = agent(conversation, {});
    agentInstance`Hello, world!`;
    expect(conversation.messages).toHaveLength(1);
    expect(conversation.messages[0]?.content).toBe("Hello, world!");
  });

  it("should generate a message from action with input", async () => {
    const settings: RetortConfiguration = {
      model: "gpt-3.5-turbo",
      role: "user",
      provider: "openai",
      action: "input",
    };
    const agentInstance = agent(conversation, settings);
    agentInstance`Test input`;
    const message = conversation.messages[0];

    expect(message.content).toBe("Test input");
    expect(message.role).toBe(settings.role);
  });

  it("should preserve the order of messages added to the conversation", () => {
    const agentInstance = agent(conversation, {});
    agentInstance("First message");
    agentInstance("Second message");
    expect(conversation.messages[0]?.content).toBe("First message");
    expect(conversation.messages[1]?.content).toBe("Second message");
  });
});
