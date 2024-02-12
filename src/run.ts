import { Conversation } from "./conversation";
import { getScript } from "./get-script";
import { RetortScriptInProgress } from "./script";
import { createRequire } from 'node:module';

export function run(scriptName: string) {

  const conversation = new Conversation();



  async function runInner() {
    let s = await getScript(scriptName);
    let req = createRequire(s.url);
    return s.script.__scriptFunc(conversation, req);
  }

  let executing = runInner();

  let scriptInProgress: RetortScriptInProgress<any> = {
    $: conversation,
    completionPromise: executing,
    retortType: "RetortScriptInProgress",
  };

  return scriptInProgress;


}