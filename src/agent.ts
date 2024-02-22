import { Conversation } from "./conversation";
import { defineGeneration } from "./define-generation";
import { defineInput } from "./define-input";
import { definePrompt } from "./define-prompt";
import { RetortExtendableFunction } from "./extendable-function";
import { logMessage } from "./log-message";
import { RetortMessage, RetortValue, isTemplateStringsArray } from "./message";
import { openAiChatCompletion } from "./openai-chat-completion";
import readline from "readline";




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
}

interface AgentMembers {
  conversation: Conversation;
  settings: RetortConfiguration;
}

export interface Agent extends AgentFunction, AgentMembers {

}

class RetortAgent extends RetortExtendableFunction {

  conversation: Conversation;
  role: RetortRole;

  __wrappedFunction(value0: string | TemplateStringsArray, ...values: RetortValue[]) {
    return this.prompt(value0, ...values);
  }

  constructor(conversation: Conversation, role: RetortRole) {
    super();
    this.conversation = conversation;
    this.role = role;
  }


  get input() {
    return defineInput(this.conversation, this.role, true)
  };

  get generation() {
    return defineGeneration(this.conversation, this.role, true);
  }

  get prompt() {
    return definePrompt(this.conversation, this.role, true);
  }

}

const _RetortAgent = RetortAgent as unknown as AgentFunction & RetortAgent

export { _RetortAgent as RetortAgent };

export function agent(conversation: Conversation, role: RetortRole): RetortAgent {
  return new RetortAgent(conversation, role);
}



export type RetortAction = "input" | "generation" | "answer" | "instruction";

export type RetortRole = "user" | "assistant" | "system";

export type RetortProvider = "openai";

export interface RetortConfiguration {
  model: string;
}


