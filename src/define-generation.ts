import { RetortConfiguration, RetortRole } from "./agent";
import { Conversation } from "./conversation";
import { logMessage } from "./log-message";
import { RetortMessage } from "./message";
import readline from "readline";
import { openAiChatCompletion } from "./openai-chat-completion";


export function defineGeneration(conversation: Conversation, role: RetortRole, push: boolean) {

  return async function generation(generationSettings?: Partial<RetortConfiguration>) {
    let messagePromises = conversation.messagePromises.slice(0);

    let content = await openAiChatCompletion(conversation.settings, messagePromises);
    let message = new RetortMessage({ role, content });
    
    if (push) {
      conversation.messagePromises.push(message);
      logMessage(message);
    }

    return message;
  }

}
