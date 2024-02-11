import { Conversation } from "./conversation";
import { id } from "./id";

export interface RetortScript<T> {
  run: (...values: any[]) => RetortScriptInProgress<T>;
  scriptId: string;
  __retortType: "script";
}

export interface RetortScriptInProgress<T> {
  scriptId: string;
  $: Conversation;
  completionPromise: Promise<T>;
}

export function script<T>(chatFunction: ChatFunction<T>): RetortScript<T> {
  let scriptId = id("script");

  let run = (...values: any[]): RetortScriptInProgress<T> => {
    const conversation = new Conversation();

    async function runInner() {
      return chatFunction(conversation, ...values);
    }

    let executing = runInner();

    let scriptInProgress = {
      scriptId,
      $: conversation,
      completionPromise: executing,
    };

    return scriptInProgress;
  };

  let returnedModule: RetortScript<T> = {
    scriptId,
    run,
    __retortType: "script",
  };

  // Only run the chat function if this module is the main module.
  setTimeout(() => {
    if (returnedModule.scriptId === require.main?.exports?.scriptId) {
      returnedModule.run();
    }
  }, 0);

  return returnedModule;
}

type ChatFunction<T> = ($: Conversation, ...values: any[]) => T;
