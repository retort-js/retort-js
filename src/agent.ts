import { RetortConversation } from "./conversation";
import { defineGeneration } from "./define-generation";
import { defineInput } from "./define-input";
import { definePrompt } from "./define-prompt";
import { RetortExtendableFunction } from "./extendable-function";
import { RetortMessage, RetortValue, isTemplateStringsArray } from "./message";

// TODO - tell typescript that call, bind apply, etc are not important,
// and should be ignored in intellisense.

export interface RetortAgent {

  // assistant ("Hello")
  (content: string): RetortMessage;

  // assistant `Hello`
  (templateStrings: TemplateStringsArray, ...values: RetortValue[]): RetortMessage;
}

export class RetortAgent extends RetortExtendableFunction {

  conversation: RetortConversation;
  role: RetortRole;

  protected __wrappedFunction(value0: string | TemplateStringsArray, ...values: RetortValue[]) {
    return this.prompt(value0, ...values);
  }

  constructor(conversation: RetortConversation, role: RetortRole) {
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

export function agent(conversation: RetortConversation, role: RetortRole): RetortAgent {
  return new RetortAgent(conversation, role);
}



// export type RetortAction = "input" | "generation" | "answer" | "instruction";

export type RetortRole = "user" | "assistant" | "system";

// export type RetortProvider = "openai";

export interface RetortSettings {
  model: string;
  temperature: number;
  topP: number;
}

export interface RetortInputSettings extends RetortSettings {
  query?: string;
}


