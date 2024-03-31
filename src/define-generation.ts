import { RetortSettings, RetortRole } from "./agent";
import { RetortConversation } from "./conversation";
import { logMessage } from "./log-message";
import { RetortMessage } from "./message";
import { openAiChatCompletion } from "./openai-chat-completion";



export function defineGeneration(
  conversation: RetortConversation,
  role: RetortRole,
  push: boolean
) {
  return function generation(generationSettings?: Partial<RetortSettings>) {
    let streams = conversation.messagePromises.slice(0);

    let stream = openAiChatCompletion(conversation.settings, streams);
    let retortMessage = new RetortMessage({ stream, role })


    if (push) {
      conversation.messages.push(retortMessage);
    }

    retortMessage.promise.then((message) => {
      logMessage(message);
    });

    return retortMessage;
  };
}
