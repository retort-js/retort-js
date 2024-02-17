import { Conversation } from "./conversation";
import { id } from "./id";

interface RetortScript<T> {
  _run: (...values: any[]) => RetortScriptInProgress<T>;
  retortId: string;
  retortType: "retort";
}

interface RetortScriptInProgress<T> {
  retortId: string;
  $: Conversation;
  completionPromise: Promise<T>;
}

export function Retort<T>(chatFunction: ChatFunction<T>): RetortScript<T> {
  let retortId = id("retort");

  let run = (...values: any[]): RetortScriptInProgress<T> => {
    const conversation = new Conversation();

    async function runInner() {
      return chatFunction(conversation, ...values);
    }

    let executing = runInner();

    let scriptInProgress = {
      retortId: retortId,
      $: conversation,
      completionPromise: executing,
    };

    return scriptInProgress;
  };

  let returnedModule: RetortScript<T> = {
    retortId: retortId,
    _run: run,
    retortType: "retort",
  };

  // Only run the chat function if this module is the main module.
  setTimeout(() => {
    if (returnedModule.retortId === require.main?.exports?.scriptId) {
      returnedModule._run();
    }
  }, 0);

  return returnedModule;
}

type ChatFunction<T> = ($: Conversation, ...values: any[]) => T;
