import { RetortConversation, RetortScriptImport } from "./conversation";
import { Retort, retort } from "./retort";
import { logScript } from "./logger";
import { ChatFunction } from "./retort";

export type RetortRunOptions = {
  shouldSaveToLog?: boolean;
  shouldUseCache?: boolean; // or something that provides the cache
};

const defaultRunOptions: RetortRunOptions = {
  shouldSaveToLog: true,
  shouldUseCache: false,
};
export type RetortRunnable<T> =
  | Promise<RetortScriptImport<T>>
  | Retort<T>
  | RetortScriptImport<T>
  | ChatFunction<T>;

export async function run<T>(
  promiseOrRetortOrChatFunction: RetortRunnable<T>,
  params: any = null,
  options: RetortRunOptions = defaultRunOptions
) {
  if (options === undefined) {
    options = defaultRunOptions;
  }

  let ret = await promiseOrRetortOrChatFunction;

  if ("default" in ret) {
    ret = ret.default;
  }

  if (typeof ret === "function") {
    ret = retort(ret);
  }

  options = { ...defaultRunOptions, ...options };

  if (!ret._run) {
    throw new Error("Tried to run something that is not a retort.");
  }

  const retortInProgress = ret._run();

  const awaitedCompletionPromise = await retortInProgress.completionPromise;

  if (options.shouldSaveToLog) {
    try {
      await logScript(ret.retortHash, retortInProgress.$);
    } catch (e) {
      console.error("There was an error saving this run to the log.", (e as Error).message);
    }
  }

  return awaitedCompletionPromise;
}
