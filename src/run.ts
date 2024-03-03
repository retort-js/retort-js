import { RetortScriptImport } from "./conversation";
import { Retort } from "./retort";

export async function run<T>(promiseOrRetort: Promise<RetortScriptImport<T>> | Retort<T> | RetortScriptImport<T>) {
  let retort: Retort<T>;

  if (promiseOrRetort instanceof Promise) {
    const script = await promiseOrRetort;
    retort = script.default;
  } else {
    retort = (promiseOrRetort as RetortScriptImport<any>)?.default ?? promiseOrRetort;
  }

  const rt = retort._run();
  return await rt.completionPromise;
}
