import { log } from "console";
import { RetortSettings, RetortRole } from "./agent";
import { RetortConversation } from "./conversation";
import { logMessage } from "./log-message";
import { RetortMessage } from "./message";
import { openAiChatCompletion } from "./openai-chat-completion";

export interface RetortMessagePromise extends Promise<RetortMessage> {
  stream: AsyncIterable<string>;
}

export function defineGeneration(
  conversation: RetortConversation,
  role: RetortRole,
  push: boolean
) {
  return function generation(generationSettings?: Partial<RetortSettings>) {
    let messagePromises = conversation.messagePromises.slice(0);

    let currentStream = openAiChatCompletion(
      conversation.settings,
      messagePromises
    );

    async function xxxx() {
      let content = "";
      for await (const chunk of currentStream) {
        content += chunk;
      }

      let message = new RetortMessage({ role, content });
      return message;
    }

    let promise = xxxx() as RetortMessagePromise;

    promise.stream = currentStream;

    if (push) {
      conversation.messagePromises.push(promise);
    }

    return promise;
  };
}
