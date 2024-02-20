import { Conversation } from "./conversation";
import { RetortExtendableFunction } from "./extendable-function";
import { RetortMessage, RetortValue, createTemplateTag, isTemplateStringsArray } from "./message";
import { openAiChatCompletion } from "./openai-chat-completion";
import readline from "readline";

function logMessage(message: RetortMessage) {

  let color = '';
  switch (message.role) {
    case 'user':
      color = '\x1b[34m'; // Blue
      break;
    case 'assistant':
      color = '\x1b[32m'; // Green
      break;
    case 'system':
      color = '\x1b[33m'; // Yellow
      break;
    default:
      color = '\x1b[0m'; // Reset
  }
  const resetColor = '\x1b[0m';
  const contentColor = '\x1b[37m'; // White
  console.log(`\n${color}${message.role}${resetColor} ${contentColor}\`${message.content}\`${resetColor}`);
}




function askQuestion(query: string): Promise<string> {

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {


    return rl.question("\n" + query, ans => {
      readline.moveCursor(process.stdout, 0, -2);
      readline.clearScreenDown(process.stdout);

      rl.close();

      resolve(ans);
    })
  });
}

interface AgentFunction {

  // assistant ("Hello")
  (content: string): RetortMessage;

  // assistant `Hello`
  (templateStrings: TemplateStringsArray, ...values: RetortValue[]): RetortMessage;

  // assistant() 
  // or 
  // assistant({model: "gpt-5"})
  (settings?: Partial<RetortConfiguration>): Promise<RetortMessage>;
}

interface AgentMembers {
  conversation: Conversation;
  settings: RetortConfiguration;
}

export interface Agent extends AgentFunction, AgentMembers {

}

class RetortAgent extends RetortExtendableFunction {

  conversation: Conversation;
  settings: RetortConfiguration;

  __wrappedFunction(value0: string | (Partial<RetortConfiguration> & Content) | TemplateStringsArray, ...values: RetortValue[]) {
    if (typeof value0 === "string") {
      let message = messageFromStringGenerator(this.settings)(value0);

      logMessage(message)
      this.conversation.messagePromises.push(message);
      return message;
    }
    else if (isTemplateStringsArray(value0) && value0 instanceof Array) {
      let message = messageFromTemplateGenerator(this.settings)(value0, ...values);

      logMessage(message)
      this.conversation.messagePromises.push(message);
      return message;
    }
    else if (!value0 || typeof value0 === "object") {
      // snapshot messsagePromises
      let messagePromises = this.conversation.messagePromises.slice(0);

      let messagePromise = messageFromActionGenerator(this.settings, messagePromises)(value0 || {});

      messagePromise.then(m => logMessage(m));
      this.conversation.messagePromises.push(messagePromise);

      // Swap out the promise for the resolved message
      messagePromise.then(m => {
        for (let i = 0; i < messagePromises.length; i++) {
          if (messagePromises[i] === messagePromise) {
            this.conversation.messagePromises[i] = m;
          }
        }
      })


      return messagePromise;
    }
    else {
      throw new Error("Invalid message type.");
    }


  }
  





  constructor(conversation: Conversation, inputSettings: Partial<RetortConfiguration>) {
    super();
    this.conversation = conversation;


    let settings: RetortConfiguration = {
      model: "gpt-3.5-turbo",
      role: "user",
      provider: "openai",
      action: "generation",
    };

    this.settings = settings = { ...settings, ...(inputSettings || {}) };;
  }

}

const _RetortAgent = RetortAgent as unknown as AgentFunction & RetortAgent

export {_RetortAgent as RetortAgent};



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

type MessageMethod = MessageFromString | MessageFromTemplate | MessageFromObject;


function messageFromStringGenerator(settings: RetortConfiguration) {
  return function messageFromString(content: string): RetortMessage {
    return new RetortMessage({ ...settings, content: content });
  }
}
function messageFromTemplateGenerator(settings: RetortConfiguration) {
  return createTemplateTag(settings);
}

type Content = { content: string }

function messageFromActionGenerator(settings: RetortConfiguration, messagePromises: (RetortMessage | Promise<RetortMessage>)[] = []) {
  return function messageFromAction(settings2: Partial<RetortConfiguration>): Promise<RetortMessage> {
    let settings3 = { ...settings, ...settings2 };

    if (settings3.action === "input") {
      // Get input from console
      return askQuestion("input: ").then(content => {
        return new RetortMessage({ ...settings3, content: content });
      });
    }
    else if (settings3.action === "generation") {
      return openAiChatCompletion(settings3, messagePromises);
    }

    throw new Error(`Action "${settings3.action}" not implemented.`);
  }
}

