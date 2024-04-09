import { RetortConversation } from "./conversation";
import { defineGeneration } from "./define-generation";
import { defineInput } from "./define-input";
import { definePrompt } from "./define-prompt";
import { RetortExtendableFunction } from "./extendable-function";
import { RetortMessage, RetortValue, RetortValueArray, isTemplateStringsArray } from "./message";

// TODO - tell typescript that call, bind apply, etc are not important,
// and should be ignored in intellisense.

export interface RetortAgent {

  // assistant ("Hello")
  (content: string): RetortMessage;

  // assistant `Hello`
  <T extends any[]>(templateStrings: TemplateStringsArray, ...values: RetortValueArray<T>): RetortMessage;
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

  private get prompt() {
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
  model: RetortModel;
  temperature: number;
  topP: number;
  maxTokens?: number;
}

export interface RetortInputSettings extends RetortSettings {
  query?: string;
}

const modelNameBrand = Symbol();


type ClaudeModel =
| 'claude-3-opus-20240229'
| 'claude-3-sonnet-20240229'
| 'claude-3-haiku-20240307'
| 'claude-2.1'
| 'claude-2.0'
| 'claude-instant-1.2';

type OpenAIModel = 
| 'gpt-4-0125-preview'
| 'gpt-4-turbo-preview'
| 'gpt-4-1106-preview'
| 'gpt-4-vision-preview'
| 'gpt-4-1106-vision-preview'
| 'gpt-4'
| 'gpt-4-0613'
| 'gpt-4-32k'
| 'gpt-4-32k-0613'
| 'gpt-3.5-turbo-0125'
| 'gpt-3.5-turbo'
| 'gpt-3.5-turbo-1106'
| 'gpt-3.5-turbo-16k'
| 'gpt-3.5-turbo-0613'
| 'gpt-3.5-turbo-16k-0613';

export type RetortModel = ClaudeModel | OpenAIModel | String;


