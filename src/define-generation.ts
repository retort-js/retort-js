import { RetortSettings, RetortRole } from "./agent";
import { RetortConversation } from "./conversation";
import { logMessage } from "./log-message";
import { RetortMessage } from "./message";
import { openAiChatCompletion } from "./openai-chat-completion";
import teeAsync from "./tee-async";

export interface RetortMessagePromise extends Promise<RetortMessage> {
  stream: AsyncGenerator<string, void, unknown>;
}

export function defineGeneration(
  conversation: RetortConversation,
  role: RetortRole,
  push: boolean
) {
  return function generation(generationSettings?: Partial<RetortSettings>) {
    let settings = { ...conversation.settings, ...generationSettings };
    let streams = conversation.messagePromises.slice(0);

    let streamGenerator = teeAsync(
      openAiChatCompletion(settings, streams)
    );

    let internalStream = streamGenerator[0];
    let exposedStream = streamGenerator[1];


    async function messagePromise() {
      let content = "";
      for await (const chunk of internalStream) {
        content += chunk; 
      }

      let message = new RetortMessage({ role, content });
      return message;
    }

    let promise = messagePromise() as RetortMessagePromise;

    promise.stream = exposedStream;

    if (push) {
      conversation.messagePromises.push(promise);
    }

    promise.then((message) => {
      logMessage(message);
    });

    return promise;
  };
}
