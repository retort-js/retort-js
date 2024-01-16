import { RetortMessage, RetortValue, createTemplateTag, isTemplateStringsArray } from "./message";

export class Agent {
  settings: RetortConfiguration;

  constructor(settings?: Partial<RetortConfiguration>) {
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

  message(content: string): Promise<RetortMessage>;
  message(templateStrings: TemplateStringsArray, ...values: RetortValue[]): RetortMessage;
  message(content: Partial<RetortConfiguration> & Content): Promise<RetortMessage>;


  message(value0: string | (Partial<RetortConfiguration> & Content) | TemplateStringsArray, ...values: any[]): Promise<RetortMessage> | RetortMessage {
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

export type RetortAction = "input" | "generation" | "answer";

export type RetortRole = "user" | "assistant" | "system";

export type RetortProvider = "openai";

export interface RetortConfiguration {
  model: string;
  role: RetortRole;
  provider: RetortProvider;
  action: RetortAction | null;
}

type MessageFromString = ReturnType<typeof messageFromStringGenerator>;
type MessageFromTemplate = ReturnType<typeof messageFromTemplateGenerator>;
type MessageFromObject = ReturnType<typeof messageFromObjectGenerator>;

type MessageMethod = MessageFromString | MessageFromTemplate | MessageFromObject;


function messageFromStringGenerator(settings: RetortConfiguration) {
  return async function messageFromString(content: string): Promise<RetortMessage> {
    return new RetortMessage({ ...settings, content: content });
  }
}
function messageFromTemplateGenerator(settings: RetortConfiguration) {
  return createTemplateTag(settings);
}

type Content = { content: string }

function messageFromObjectGenerator(settings: RetortConfiguration) {
  return async function messageFromObject(settings2: Partial<RetortConfiguration> & Content): Promise<RetortMessage> {
    return new RetortMessage({ ...settings, ...settings2 });
  }
}

