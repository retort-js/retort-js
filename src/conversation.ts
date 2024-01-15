import { OpenAiCompletionAgent } from "./open-ai-completion-agent";

export class Conversation {

    chat = this;
    user = new OpenAiCompletionAgent({ role: "user" });
    assistant = new OpenAiCompletionAgent({ role: "assistant" });
    system = new OpenAiCompletionAgent({ role: "system" });


}