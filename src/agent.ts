import { RetortConversation } from "./conversation";
import { defineGeneration } from "./define-generation";
import { defineInput } from "./define-input";
import { definePrompt } from "./define-prompt";
import { RetortExtendableFunction } from "./extendable-function";
import { RetortMessage, RetortMessagePromise, RetortValue, RetortValueArray, isTemplateStringsArray } from "./message";
import { RetortRunOptions, RetortRunnable } from "./run";

// TODO - tell typescript that call, bind apply, etc are not important,
// and should be ignored in intellisense.

export interface RetortAgent {

  // assistant ("Hello")
  (content: string): RetortMessage;

  // assistant `Hello`
  <T extends any[]>(templateStrings: TemplateStringsArray, ...values: RetortValueArray<T>): RetortMessage;


}

export interface RetortAssistant extends RetortAgent {
  // assistant({ model: "gpt-4", temperature: 0.7 })
  (settings?: Partial<RetortSettings>): RetortMessagePromise;

}

export interface RetortUser extends RetortAgent {
  // assistant({query: "Write your name"})
  (settings?: RetortInputSettings): RetortMessagePromise;
}

export interface RetortSystem extends RetortAgent {
}

export class RetortAgent extends RetortExtendableFunction {

  conversation: RetortConversation;
  role: RetortRole;
  private defaultAction: string;

  protected __wrappedFunction(value0?: string | TemplateStringsArray | Partial<RetortSettings>, ...values: RetortValue[]) {
    if (typeof value0 === "object" || value0 === undefined) {
      if (isTemplateStringsArray(value0)) {
        return this.prompt(value0, ...values);
      } else {
        if (this.defaultAction === "generation") {
          return this.generation(value0);
        }
        else if (this.defaultAction === "input") {
          return this.input(value0);
        }
        else if (this.defaultAction === "system") {
          throw new Error("$.system() does not currently do anything");
        }
      }
    }
    else if (typeof value0 === "string") {
      // TODO - this behaviour should be removed.
      return this.prompt(value0);
    }
    throw new Error(`Invalid arguments passed to agent: ${value0}`);
  }

  constructor(conversation: RetortConversation, role: RetortRole, defaultAction: "generation" | "input" | "system") {
    super();
    this.conversation = conversation;
    this.role = role;
    this.defaultAction = defaultAction;
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

function agent(conversation: RetortConversation, role: RetortRole, defaultAction: "generation" | "input" | "system"): RetortAgent {
  return new RetortAgent(conversation, role, defaultAction);
}

export function assistant(conversation: RetortConversation): RetortAssistant {
  return agent(conversation, "assistant", "generation") as RetortAssistant;
}

export function user(conversation: RetortConversation): RetortUser {
  return agent(conversation, "user", "input") as RetortUser;
}

export function system(conversation: RetortConversation): RetortAgent {
  return agent(conversation, "system", "system");
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


