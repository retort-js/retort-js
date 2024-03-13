import { RetortSettings, RetortRole } from "./agent";
import { RetortConversation } from "./conversation";
import { logMessage } from "./log-message";
import { RetortMessage } from "./message";
import { openAiChatCompletion } from "./openai-chat-completion";

export interface RetortMessagePromise extends Promise<RetortMessage> {
  stream: AsyncGenerator<string, void, unknown>;
}

export function defineGeneration(
  conversation: RetortConversation,
  role: RetortRole,
  push: boolean
) {
  return function generation(generationSettings?: Partial<RetortSettings>) {
    let streams = conversation.messagePromises.slice(0);

    let currentStream = openAiChatCompletion(
      conversation.settings,
      streams
    );

    let promiseResolver = (message: RetortMessage) => {};
    let promiseRejecter = (error: unknown) => {};

    let newPromise = new Promise<RetortMessage>((resolve, reject) => {
      promiseResolver = resolve;
      promiseRejecter = reject;
    }) as RetortMessagePromise;

    async function* stream() {
      try {
        let content = "";
        for await (const chunk of currentStream) {
          content += chunk;
          yield content;
        }

        let message = new RetortMessage({ role, content });
        promiseResolver(message);
      } catch (error) {
        promiseRejecter(error);
      }
    }

    newPromise.stream = stream();

    if (push) {
      conversation.messagePromises.push(newPromise);
    }

    newPromise.then((message) => {
      logMessage(message);
    });

    return newPromise;
  };
}
