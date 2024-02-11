import { Conversation } from "./conversation";
import { id } from "./id";

export interface RetortScript<T> {
  run: (params?: T) => RetortScriptInProgress<T>;
  scriptId: string;
  retortType: "RetortScript";
}

export interface RetortScriptInProgress<T> {
  scriptId: string;
  $: Conversation;
  completionPromise: Promise<T>;
  retortType: "RetortScriptInProgress";
}

export function script<T>(chatFunction: ChatFunction<T>): RetortScript<T> {
  let scriptId = id("script");

  let run = (params?: any): RetortScriptInProgress<T> => {
    const conversation = new Conversation();

    async function runInner() {
      return chatFunction(conversation);
    }

    let executing = runInner();

    let scriptInProgress: RetortScriptInProgress<T> = {
      scriptId,
      $: conversation,
      completionPromise: executing,
      retortType: "RetortScriptInProgress",
    };

    return scriptInProgress;
  };

  let returnedModule: RetortScript<T> = {
    scriptId,
    run,
    retortType: "RetortScript",
  };

  return returnedModule;
}

export function checkIsScript<T>(script: RetortScript<T>): asserts script is RetortScript<T> {

  if (typeof script !== "object") {
    throw new Error(`Expected an object, but got something else`);
  }

  if (script.retortType !== "RetortScript") {
    throw new Error(`Expected a script, but got something else`);
  }
};

type ChatFunction<T> = ($: Conversation) => T;
