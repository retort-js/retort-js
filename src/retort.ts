import { RetortConversation } from "./conversation";
import { id } from "./id";

export interface Retort<T> {
  _run: (...values: any[]) => RetortInProgress<T>;
  retortId: string;
  retortType: "retort";
}

export interface RetortInProgress<T> {
  retortId: string;
  $: RetortConversation;
  completionPromise: Promise<T>;
}

export function retort<T>(chatFunction: ChatFunction<T>): Retort<T> {
  let retortId = id("retort");

  let run = (autoHandleStreaming: boolean = true, ...values: any[]): RetortInProgress<T> => {
    const conversation = new RetortConversation();
    conversation.settings.isStreaming = autoHandleStreaming;

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

  let returnedModule: Retort<T> = {
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

type ChatFunction<T> = ($: RetortConversation, ...values: any[]) => T;
