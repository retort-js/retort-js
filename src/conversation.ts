import { Agent } from "./open-ai-completion-agent";

export class Conversation {

    chat = this;
    user = new Agent({ role: "user", action: "input" });
    assistant = new Agent({ role: "assistant", action: "generation" });
    system = new Agent({ role: "system", action: null });


}