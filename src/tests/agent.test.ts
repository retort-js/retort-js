import { describe, it, expect, beforeEach } from "vitest";
import { agent, RetortConfiguration } from "../agent";
import { Conversation } from "../conversation";



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

    expect(result.settings).toEqual({
      model: "gpt-3.5-turbo",
      role: "user",
      provider: "openai",
      action: "generation",
    });
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
    agentInstance(`Hello, world!`);
    expect(conversation.messages).toHaveLength(1);
    expect(conversation.messages[0]?.content).toBe("Hello, world!");
  });
});
