import { RetortSettings, RetortRole } from "./agent";
import { claudeChatCompletion } from "./claude-chat-completion";
import { RetortConversation } from "./conversation";
import { logMessage } from "./log-message";
import { RetortMessage, RetortMessagePromise } from "./message";
import { openAiChatCompletion } from "./openai-chat-completion";
import { RetortObjectSchema, RetortSchemaToType } from "./tooling";



export interface RetortParamaterization<T extends RetortObjectSchema | undefined> {
  name?: string;
  description?: string;
  parameters: T;
}

// If the user specifies parameters, we return a RetortJsonMessage. Otherwise, we return a RetortMessage.
type MapToSchemaType<T extends RetortObjectSchema | undefined> = T extends RetortObjectSchema ? RetortSchemaToType<T> : string;

export function defineGeneration(
  conversation: RetortConversation,
  role: RetortRole,
  push: boolean
): <T extends RetortObjectSchema | undefined = undefined>(generationSettings?: Partial<RetortSettings> & (RetortParamaterization<T> | {})) => RetortMessagePromise<MapToSchemaType<T>> {
  return function generation(generationSettings?: Partial<RetortSettings>) {
    let settings = { ...conversation.settings, ...generationSettings }
    let promises = conversation.messages.map((message) => message.promise);



    if (settings?.model?.startsWith("claude-")) {
      var stream = claudeChatCompletion(settings, promises);
    }
    else {
      // Default to OpenAI.
      stream = openAiChatCompletion(settings, promises);
    }



    let retortMessage = new RetortMessage({ stream, role, json: !!("parameters" in settings && settings.parameters) })


    if (push) {
      conversation.messages.push(retortMessage);
    }

    retortMessage.promise.then((message) => {
      logMessage(message);
    });

    return retortMessage.promise;
  };
}
