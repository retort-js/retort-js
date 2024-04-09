import { RetortSettings, RetortRole } from "./agent";
import { claudeChatCompletion } from "./claude-chat-completion";
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
    let promises = conversation.messages.map((message) => message.promise);

    if (generationSettings?.model?.startsWith("gpt-")) {
      var stream = openAiChatCompletion(conversation.settings, promises);
    }
    else if (generationSettings?.model?.startsWith("claude-")) {
      stream = claudeChatCompletion(conversation.settings, promises);
    }
    else {
      throw new Error("Unsupported model: " + generationSettings?.model);
    }



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
