import { RetortConversation, RetortScriptImport } from "./conversation";
import { Retort, retort } from "./retort";
import { logScript } from "./logger";
import { ChatFunction } from "./retort";

type RunOptions = {
  shouldSaveToLog?: boolean;
  shouldUseCache?: boolean; // or something that provides the cache
};

const defaultRunOptions: RunOptions = {
  shouldSaveToLog: true,
  shouldUseCache: false,
};
export async function run<T>(
  promiseOrRetortOrChatFunction:
    | Promise<RetortScriptImport<T>>
    | Retort<T>
    | RetortScriptImport<T>
    | ChatFunction<T>,
  params: any = null,
  options: RunOptions = defaultRunOptions
) {
  let ret = await promiseOrRetortOrChatFunction;


  if ("default" in ret)  {
    ret = ret.default;
  }

  if (typeof ret === "function") {
    ret = retort(ret);
  }


  options = { ...defaultRunOptions, ...options };

  if (!ret._run) {
    throw new Error(
      "Tried to run something that is not a retort."
    );
  }

  const retortInProgress = ret._run();

  const awaitedCompletionPromise = await retortInProgress.completionPromise;

  // when it runs into an input

  // we'll need re-run and continue the conversation

  //  on the server
  // create an input id (global)
  // create an input hook on the server



  if (!options.shouldSaveToLog) {
    return awaitedCompletionPromise;
  }

  if (!awaitedCompletionPromise) {
    const resolvedRetort = await retortInProgress;
    const messages = await Promise.all(resolvedRetort.$.messagePromises);
    const { id, settings } = resolvedRetort.$;
    logScript(ret.retortHash, { id, settings, messages });
    return awaitedCompletionPromise;
  }

  if (awaitedCompletionPromise instanceof RetortConversation) {
    await Promise.all(awaitedCompletionPromise.messagePromises);
  }

  logScript(ret.retortHash, awaitedCompletionPromise);
  return awaitedCompletionPromise;
}
