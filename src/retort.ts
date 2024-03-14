import { createHash } from "./logger";
import { RetortConversation } from "./conversation";
import { id } from "./id";
import { run } from "./run";

export interface Retort<T> {
  _run: (...values: any[]) => RetortInProgress<T>;
  retortId: string;
  retortHash: string;
  retortType: "retort";
}

export interface RetortInProgress<T> {
  retortId: string;
  $: RetortConversation;
  completionPromise: Promise<T>;
}

export function retort<T>(chatFunction: ChatFunction<T>): Retort<T> {
  let retortId = id("retort");

  let _run = (...values: any[]): RetortInProgress<T> => {
    const conversation = new RetortConversation();

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
    retortHash: createHash(chatFunction.toString()),
    _run: _run,
    retortType: "retort",
  };

  const silent = process.argv.includes("--silent");

  // Only run the chat function if this module is the main module.
  setTimeout(() => {
    if (returnedModule.retortId === require.main?.exports?.retortId) {
      run(returnedModule, null, { shouldSaveToLog: !silent });
    }
  }, 0);

  return returnedModule;
}

type ChatFunction<T> = ($: RetortConversation, ...values: any[]) => T;
