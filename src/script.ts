import { Conversation } from "./conversation";
import { id } from "./id";

export interface RetortScript<T> {
  __scriptFunc: ScriptFunction<T>
  scriptId: string;
  retortType: "RetortScript";
}

export interface RetortScriptInProgress<T> {
  $: Conversation;
  completionPromise: Promise<T>;
  retortType: "RetortScriptInProgress";
}

export function script<T>(scriptFunc: ScriptFunction<T>): RetortScript<T> {
  let scriptId = id("script");

  let returnedModule: RetortScript<T> = {
    scriptId,
    __scriptFunc: scriptFunc,
    retortType: "RetortScript",
  };

  return returnedModule;
}

export function checkIsScriptObject<T>(script: RetortScript<T>): asserts script is RetortScript<T> {

  if (typeof script !== "object") {
    throw new Error(`Expected an object, but got something else`);
  }

  if (script.retortType !== "RetortScript") {
    throw new Error(`Expected a script, but got something else`);
  }
};

export type ScriptFunction<T> = ($: Conversation) => T;
