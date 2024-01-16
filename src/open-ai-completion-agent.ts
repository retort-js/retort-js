import { RtMessage, RtTagTemplateValue, createTemplateTag, isTemplateStringsArray } from "./rt-message";

export class Agent {
  settings: Configuration;

  constructor(settings?: Partial<Configuration>) {
    this.settings = {
      model: "gpt-3.5-turbo",
      role: "user",
      provider: "openai",
      action: "generation",
    };


    if (settings) {
      this.settings = { ... this.settings, ...settings };
    }
  }

  message(content: string): Promise<RtMessage>;
  message(templateStrings: TemplateStringsArray, ...values: RtTagTemplateValue[]): Promise<RtMessage>;
  message(content: Partial<Configuration> & Content): Promise<RtMessage>;


  message(value0: string | (Partial<Configuration> & Content) | TemplateStringsArray, ...values: any[]): Promise<RtMessage> {
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

export type Action = "input" | "generation" | "answer";

export type Role = "user" | "assistant" | "system";

export type Provider = "openai";

export interface Configuration {
  model: string;
  role: Role;
  provider: Provider;
  action: Action | null;
}

type MessageFromString = ReturnType<typeof messageFromStringGenerator>;
type MessageFromTemplate = ReturnType<typeof messageFromTemplateGenerator>;
type MessageFromObject = ReturnType<typeof messageFromObjectGenerator>;

type MessageMethod = MessageFromString | MessageFromTemplate | MessageFromObject;


function messageFromStringGenerator(settings: Configuration) {
  return async function messageFromString(content: string): Promise<RtMessage> {
    return new RtMessage({ ...settings, content: content });
  }
}
function messageFromTemplateGenerator(settings: Configuration) {
  return createTemplateTag(settings);
}

type Content = { content: string }

function messageFromObjectGenerator(settings: Configuration) {
  return async function messageFromObject(settings2: Partial<Configuration> & Content): Promise<RtMessage> {
    return new RtMessage({ ...settings, ...settings2 });
  }
}

