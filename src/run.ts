import { RetortConversation, RetortScriptImport } from "./conversation";
import { Retort } from "./retort";
import { logScript } from "./logger";

type RunOptions = {
  shouldSaveToLog?: boolean;
  shouldUseCache?: boolean; // or something that provides the cache
};

const defaultRunOptions: RunOptions = {
  shouldSaveToLog: true,
  shouldUseCache: false,
};
export async function run<T>(
  promiseOrRetort:
    | Promise<RetortScriptImport<T>>
    | Retort<T>
    | RetortScriptImport<T>,
  params: any = null,
  options: RunOptions = defaultRunOptions
) {
  let retort: Retort<T>;

  if (promiseOrRetort instanceof Promise) {
    const script = await promiseOrRetort;
    retort = script.default;
  } else {
    retort =
      (promiseOrRetort as RetortScriptImport<any>)?.default ?? promiseOrRetort;
  }

  options = { ...defaultRunOptions, ...options };

  const retortInProgress = retort._run();

  const awaitedCompletionPromise = await retortInProgress.completionPromise;

  if (!options.shouldSaveToLog) {
    return awaitedCompletionPromise;
  }

  if (!awaitedCompletionPromise) {
    const resolvedRetort = await retortInProgress;
    const messages = await Promise.all(resolvedRetort.$.messagePromises);
    const { id, settings } = resolvedRetort.$;
    logScript(retort.retortHash, { id, settings, messages });
    return awaitedCompletionPromise;
  }

  if (awaitedCompletionPromise instanceof RetortConversation) {
    await Promise.all(awaitedCompletionPromise.messagePromises);
  }

  logScript(retort.retortHash, awaitedCompletionPromise);
  return awaitedCompletionPromise;
}
