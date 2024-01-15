import { RtMessage, createTemplateTag, isTemplateStringsArray } from "./rt-message";

export class OpenAiCompletionAgent {
  settings: OpenAiCompletionAgentSettings;

  constructor(settings?: Partial<OpenAiCompletionAgentSettings>) {
    this.settings = {
      model: "gpt-3.5-turbo",
      role: "user",
    };


    if (settings) {
      this.settings = { ... this.settings, ...settings };
    }
  }

  message(content: string): Promise<RtMessage>;
  message(templateStrings: TemplateStringsArray, ...values: any[]): Promise<RtMessage>;
  message(content: Partial<OpenAiCompletionAgentSettings> & Content): Promise<RtMessage>;


  message(value0: string | (Partial<OpenAiCompletionAgentSettings> & Content) | TemplateStringsArray, ...values: any[]): Promise<RtMessage> {
    if (typeof value0 === "string") {
      let result = messageFromStringGenerator(this.settings)(value0);
      return result;
    }
    else if (isTemplateStringsArray(value0)) {
      return messageFromTemplateGenerator(this.settings)(value0, ...values);
    }
    else if (typeof value0 === "object") {
      return messageFromObjectGenerator(this.settings)({ ...value0 });
    }
    else {
      throw new Error("Invalid message type.");
    }


  }
}

export interface OpenAiCompletionAgentSettings {
  model: string;
  role: "user" | "assistant" | "system" | string;
}

type MessageFromString = ReturnType<typeof messageFromStringGenerator>;
type MessageFromTemplate = ReturnType<typeof messageFromTemplateGenerator>;
type MessageFromObject = ReturnType<typeof messageFromObjectGenerator>;

type MessageMethod = MessageFromString | MessageFromTemplate | MessageFromObject;


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
  return async function messageFromObject(settings2: Partial<OpenAiCompletionAgentSettings> & Content): Promise<RtMessage> {
    return new RtMessage({ ...settings, ...settings2 });
  }
}