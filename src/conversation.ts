import { agent } from "./agent";
import { Message } from "./message";

export class Conversation {

    readonly id = "conv_" + Math.random().toString(36).substring(2);
    readonly conversation = this;
    readonly messages: Message[] = [];
    user = agent(this, { role: "user", action: "input" });
    assistant = agent(this, { role: "assistant", action: "generation" });
    system = agent(this, { role: "system", action: null });

}