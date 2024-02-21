import { RetortConfiguration } from "./agent";
import { Conversation } from "./conversation";
import { logMessage } from "./log-message";
import { RetortMessage } from "./message";
import readline from "readline";
import { openAiChatCompletion } from "./openai-chat-completion";


export function defineGeneration(conversation: Conversation, getSettings: () => RetortConfiguration, push: boolean) {

  return function generation(generationSettings?: Partial<RetortConfiguration>) {
    let messagePromises = conversation.messagePromises.slice(0);

    let m = openAiChatCompletion({ ...getSettings(), ...generationSettings }, messagePromises);
    
    if (push) {
      conversation.messagePromises.push(m);
      m.then(m => logMessage(m));
    }

    return m;
  }

}
