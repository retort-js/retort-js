import { log } from "console";
import { RetortSettings } from "./agent";
import { RetortConversation } from "./conversation";
import { logMessage } from "./log-message";
import { RetortMessage, RetortValue, RetortValueArray, isTemplateStringsArray, templateContent } from "./message";
import readline from "readline";


export function definePrompt(conversation: RetortConversation, role: "user" | "assistant" | "system", push: boolean) {


  return function prompt<T extends any[]>(value0: string | TemplateStringsArray, ...values: RetortValueArray<T>) {

    let message: RetortMessage;

    if (typeof value0 === "string") {
      message = new RetortMessage({ role: role, content: value0 });
    }
    else if (isTemplateStringsArray(value0) && value0 instanceof Array) {
      message = new RetortMessage({role, content: templateContent(value0, ...values)});
    }
    else {
      throw new Error("Invalid parameter passed to prompt.");
    }



    if (push) {
      conversation.messagePromises.push(message);
      logMessage(message);
    }

    return message;
  }
}

