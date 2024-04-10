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
    let settings = { ...conversation.settings, ...generationSettings}
    let promises = conversation.messages.map((message) => message.promise);


    
    if (settings?.model?.startsWith("claude-")) {
      var stream = claudeChatCompletion(conversation.settings, promises);
    }
    else if (settings?.model?.startsWith("gpt-")) {
      stream = openAiChatCompletion(conversation.settings, promises);
    }
    else {
      // Default to OpenAI.
      stream = openAiChatCompletion(conversation.settings, promises);
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
