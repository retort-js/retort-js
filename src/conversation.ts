import { agent } from "./agent";
import { Message } from "./message";
import { id } from "./id";

export class Conversation {
    readonly id = id("cnv");
    readonly chat = this;
    readonly messagePromises: (Message | Promise<Message>)[] = [];
    get messages(): Message[] {
        for (let m of this.messagePromises) {
            if (!(m instanceof Message)) {
                throw new Error("Cannot access messages until all promises have resolved.");
            }
        }
        return this.messagePromises as Message[];
    }
    user = agent(this, { role: "user", action: "input" });
    assistant = agent(this, { role: "assistant", action: "generation" });
    system = agent(this, { role: "system", action: null });
}
