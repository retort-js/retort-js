import { RetortConversation, RetortScriptImport } from "./conversation";
import { Retort } from "./retort";
import { tryGetFromCache, saveToCache } from "./cache";

type RunOptions = {
  cache?: any; // or something that provides the cache
};


export async function run<T>(promiseOrRetort: Promise<RetortScriptImport<T>> | Retort<T> | RetortScriptImport<T>, params: any = null, options: RunOptions = {}) {
  let retort: Retort<T>;

  if (promiseOrRetort instanceof Promise) {
    const script = await promiseOrRetort;
    retort = script.default;
  } else {
    retort = (promiseOrRetort as RetortScriptImport<any>)?.default ?? promiseOrRetort;
  }

  if (options.cache) {
    const cachedRun = tryGetFromCache(retort.retortHash);
    if (cachedRun) {
      console.log("cachedRun", cachedRun);
      // TODO: 
      // do we actually need to retrieve the cachedRun?
      // how do we know if it's a conversation or a message/message array?
    }
  }

  const retortInProgress = retort._run();

  const returnedCompletionPromise = await retortInProgress.completionPromise;
  
  if (options.cache) {
      if (returnedCompletionPromise instanceof RetortConversation) {
        await Promise.all(returnedCompletionPromise.messagePromises);
      }
      saveToCache(retort.retortHash, returnedCompletionPromise);    
      // THIS WILL OVERWRITE THE CURRENT CACHED RUN.       
    }

    return returnedCompletionPromise;
  }
