import { createHash } from "./logger";
import { RetortConversation } from "./conversation";
import { id } from "./id";
import { run } from "./run";
import url from "url";

var runHasBeenTriggered = false;

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

  if (!runHasBeenTriggered) {
    // Make sure we only run the script once
    runHasBeenTriggered = true;

    setTimeout(async () => {
      // Get the running script from argv
      const mainModuleFilename = process.argv[1];

      if (!mainModuleFilename) {
        return;
      }
      else {

        // Check the script to see if it ends in *.rt.js, *.rt.cjs, or *.rt.mjs
        const isRetortScript = mainModuleFilename.match(/\.rt\.(js|cjs|mjs)\/*$/);

        if (!isRetortScript) {
          return;
        }

        // Convert the filename to a file url using url module
        const mainModuleUrl = url.pathToFileURL(mainModuleFilename);

        // Run the script
        const retort = await import(mainModuleUrl.toString());

        run(retort);

      }

    }, 0);

  }


  return returnedModule;
}

type ChatFunction<T> = ($: RetortConversation, ...values: any[]) => T;
