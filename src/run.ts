import { Conversation } from "./conversation";
import { getScriptFunc } from "./get-script-func";
import { RetortScriptInProgress } from "./script";

export default function run(scriptName: string) {


  let x = (params?: any): RetortScriptInProgress<any> => {
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
  };

  
}