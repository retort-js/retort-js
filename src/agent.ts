import { Message, RetortValue, createTemplateTag, isTemplateStringsArray } from "./message";

interface AgentFunction {
  (content: string): Promise<Message>;
  (templateStrings: TemplateStringsArray, ...values: RetortValue[]): Message;
  (content: Partial<RetortConfiguration> & Content): Promise<Message>;
}

interface AgentMembers {
  settings: RetortConfiguration;
}

interface Agent extends AgentFunction, AgentMembers {






}

export function agent(inputSettings: Partial<RetortConfiguration>): Agent {

  let settings: RetortConfiguration = {
    model: "gpt-3.5-turbo",
    role: "user",
    provider: "openai",
    action: "generation",
  };


  if (inputSettings) {
    settings = { ...settings, ...inputSettings };
  }

  let agentFunction: AgentFunction = ((value0: string | (Partial<RetortConfiguration> & Content) | TemplateStringsArray, ...values: RetortValue[]) => {
    if (typeof value0 === "string") {
      let result = messageFromStringGenerator(settings)(value0);
      return result;
    }
    else if (isTemplateStringsArray(value0) && value0 instanceof Array) {
      return messageFromTemplateGenerator(settings)(value0, ...values);
    }
    else if (typeof value0 === "object") {
      return messageFromObjectGenerator(settings)({ ...value0 });
    }
    else {
      throw new Error("Invalid message type.");
    }


  }) as AgentFunction;

  let agentMembers: AgentMembers = {
    settings: settings,
  };

  let agent = agentFunction as Agent;

  for (let key in Object.keys(agentMembers)) {
    let k = key as keyof AgentMembers;
    agent[k] = agentMembers[k];
  }

  return agent;
}


export type RetortAction = "input" | "generation" | "answer" | "instruction";

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
  return async function messageFromString(content: string): Promise<Message> {
    return new Message({ ...settings, content: content });
  }
}
function messageFromTemplateGenerator(settings: RetortConfiguration) {
  return createTemplateTag(settings);
}

type Content = { content: string }

function messageFromObjectGenerator(settings: RetortConfiguration) {
  return async function messageFromObject(settings2: Partial<RetortConfiguration> & Content): Promise<Message> {
    return new Message({ ...settings, ...settings2 });
  }
}

