import { Conversation } from "./conversation";
import {
  Message,
  RetortValue,
  createTemplateTag,
  isTemplateStringsArray,
} from "./message";
import { openAiChatCompletion } from "./openai-chat-completion";
import readline from "readline";

function logMessage(message: Message) {
  let color = "";
  switch (message.role) {
    case "user":
      color = "\x1b[34m"; // Blue
      break;
    case "assistant":
      color = "\x1b[32m"; // Green
      break;
    case "system":
      color = "\x1b[33m"; // Yellow
      break;
    default:
      color = "\x1b[0m"; // Reset
  }
  const resetColor = "\x1b[0m";
  const contentColor = "\x1b[37m"; // White
  console.log(
    `\n${color}${message.role}${resetColor} ${contentColor}\`${message.content}\`${resetColor}`
  );
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query: string): Promise<string> {
  return new Promise((resolve) =>
    rl.question("\n" + query, (ans) => {
      readline.moveCursor(process.stdout, 0, -2);
      readline.clearScreenDown(process.stdout);

      resolve(ans);
    })
  );
}

interface AgentFunction {
  // assistant ("Hello")
  (content: string): Message;

  // assistant `Hello`
  (templateStrings: TemplateStringsArray, ...values: RetortValue[]): Message;

  // assistant()
  // or
  // assistant({model: "gpt-5"})
  (settings?: Partial<RetortConfiguration>): Promise<Message>;
}

interface AgentMembers {
  conversation: Conversation;
  settings: RetortConfiguration;
}

export interface Agent extends AgentFunction, AgentMembers {}

export function agent(
  conversation: Conversation,
  inputSettings: Partial<RetortConfiguration>
): Agent {
  let settings: RetortConfiguration = {
    model: "gpt-3.5-turbo",
    role: "user",
    provider: "openai",
    action: "generation",
  };

  if (inputSettings) {
    settings = { ...settings, ...inputSettings };
  }

  let agentFunction: AgentFunction = ((
    value0:
      | string
      | (Partial<RetortConfiguration> & Content)
      | TemplateStringsArray,
    ...values: RetortValue[]
  ) => {
    if (typeof value0 === "string") {
      let message = messageFromStringGenerator(settings)(value0);

      logMessage(message);
      conversation.messagePromises.push(message);
      return message;
    } else if (isTemplateStringsArray(value0) && value0 instanceof Array) {
      let message = messageFromTemplateGenerator(settings)(value0, ...values);

      logMessage(message);
      conversation.messagePromises.push(message);
      return message;
    } else if (!value0 || typeof value0 === "object") {
      // snapshot messsagePromises
      let messagePromises = conversation.messagePromises.slice(0);

      let messagePromise = messageFromActionGenerator(
        settings,
        messagePromises
      )(value0 || {});

      messagePromise.then((m) => logMessage(m));
      conversation.messagePromises.push(messagePromise);

      // Swap out the promise for the resolved message
      messagePromise.then((m) => {
        for (let i = 0; i < messagePromises.length; i++) {
          if (messagePromises[i] === messagePromise) {
            conversation.messagePromises[i] = m;
          }
        }
      });

      return messagePromise;
    } else {
      throw new Error("Invalid message type.");
    }
  }) as AgentFunction;

  let agentMembers: AgentMembers = {
    conversation: conversation,
    settings: settings,
  };

  let agent = agentFunction as Agent;

  for (let key of Object.keys(agentMembers)) {
    // Define them as readonly properties
    Object.defineProperty(agent, key, {
      value: agentMembers[key as keyof AgentMembers],
      writable: false,
      enumerable: true,
      configurable: false,
    });
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
type MessageFromObject = ReturnType<typeof messageFromActionGenerator>;

type MessageMethod =
  | MessageFromString
  | MessageFromTemplate
  | MessageFromObject;

function messageFromStringGenerator(settings: RetortConfiguration) {
  return function messageFromString(content: string): Message {
    return new Message({ ...settings, content: content });
  };
}
function messageFromTemplateGenerator(settings: RetortConfiguration) {
  return createTemplateTag(settings);
}

type Content = { content: string };

function messageFromActionGenerator(
  settings: RetortConfiguration,
  messagePromises: (Message | Promise<Message>)[] = []
) {
  return function messageFromAction(
    settings2: Partial<RetortConfiguration>
  ): Promise<Message> {
    let settings3 = { ...settings, ...settings2 };

    if (settings3.action === "input") {
      // Get input from console
      return askQuestion("input: ").then((content) => {
        return new Message({ ...settings3, content: content });
      });
    } else if (settings3.action === "generation") {
      return openAiChatCompletion(settings3, messagePromises);
    }

    throw new Error(`Action "${settings3.action}" not implemented.`);
  };
}
