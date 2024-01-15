import { RtMessage, createTemplateTag, isTemplateStringsArray } from "./rt-message";

export class OpenAiCompletionAgent {
  settings: OpenAiCompletionAgentSettings;

  constructor(settings?: OpenAiCompletionAgentSettings) {
    this.settings = {
      model: "gpt-3.5-turbo",
      role: "user",
    };


    if (settings) {
      this.settings = { ... this.settings, ...settings };
    }
  }

  get message(): MessageMethod {
    return (...values: Parameters<MessageMethod>) => {
      if (typeof values[0] === "string") {
        return messageFromStringGenerator(this.settings)(values[0]);
      }
      else if (isTemplateStringsArray(values[0])) {
        return messageFromTemplateGenerator(this.settings)(values[0], ...values.slice(1) as any[]);
      }
      else if (typeof values[0] === "object") {
        return messageFromObjectGenerator(this.settings)(values[0]);
      }
      else {
        throw new Error("Invalid message type.");
      }

    };
  }
}

export interface OpenAiCompletionAgentSettings {
  model: string;
  role: "user" | "assistant" | "system" | string;
}

type MessageMethod =
  ReturnType<typeof messageFromStringGenerator> |
  ReturnType<typeof messageFromTemplateGenerator> |
  ReturnType<typeof messageFromObjectGenerator>;

function messageFromStringGenerator(settings: OpenAiCompletionAgentSettings) {
  return async function messageFromString(content: string): Promise<RtMessage> {
    return new RtMessage({ ...settings, content: content });
  }
}
function messageFromTemplateGenerator(settings: OpenAiCompletionAgentSettings) {
  return createTemplateTag(settings);
}

type Content = { content: string }

function messageFromObjectGenerator(settings: OpenAiCompletionAgentSettings) {
  return async function messageFromObject(settings2: OpenAiCompletionAgentSettings & Content): Promise<RtMessage> {
    return new RtMessage({ ...settings, ...settings2 });
  }
}