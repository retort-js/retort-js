import { agent } from "./agent";
import { Message } from "./message";

export class Conversation {

    readonly conversation = this;
    readonly messages: Message[] = [];
    user = agent({ role: "user", action: "input" });
    assistant = agent({ role: "assistant", action: "generation" });
    system = agent({ role: "system", action: null });


}