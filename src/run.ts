import { Conversation } from "./conversation";
import { getScriptFunc } from "./get-script-func";
import { RetortScriptInProgress } from "./script";

export function run(scriptName: string) {

  const conversation = new Conversation();

  async function runInner() {
    return (await (getScriptFunc(scriptName))).__scriptFunc(conversation);
  }

  let executing = runInner();

  let scriptInProgress: RetortScriptInProgress<any> = {
    $: conversation,
    completionPromise: executing,
    retortType: "RetortScriptInProgress",
  };

  return scriptInProgress;


}