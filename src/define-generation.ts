import { log } from "console";
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
  return async function generation(
    generationSettings?: Partial<RetortSettings>
  ) {
    let messagePromises = conversation.messagePromises.slice(0);

    // let content = await openAiChatCompletion(conversation.settings, messagePromises);
    let message = new RetortMessage({ role, content: "" });

    let completionPromise = new Promise<RetortMessage>((resolve) => resolve(message));

    if (push) {
      messagePromises.push(completionPromise);
    }

    await message.streamContent(
      openAiChatCompletion(conversation.settings, messagePromises)
    );

    await completionPromise;

    logMessage(message);

    return message;
  };
}
