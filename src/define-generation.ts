import { RetortSettings, RetortRole } from "./agent";
import { claudeChatCompletion } from "./claude-chat-completion";
import { RetortConversation } from "./conversation";
import { logMessage } from "./log-message";
import { RetortMessage, RetortMessagePromise } from "./message";
import { openAiChatCompletion } from "./openai-chat-completion";
import { RetortObjectSchema } from "./tooling";



export interface RetortGenerationOptions {
  name?: string;
  description?: string;
  parameters?: RetortObjectSchema;
}

export function defineGeneration(
  conversation: RetortConversation,
  role: RetortRole,
  push: boolean
): (generationSettings?: Partial<RetortSettings> & Partial<RetortGenerationOptions>) => RetortMessagePromise {
  return function generation(generationSettings?: Partial<RetortSettings>) {
    let settings = { ...conversation.settings, ...generationSettings}
    let promises = conversation.messages.map((message) => message.promise);


    
    if (settings?.model?.startsWith("claude-")) {
      var stream = claudeChatCompletion(conversation.settings, promises);
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

    return retortMessage.promise;
  };
}
