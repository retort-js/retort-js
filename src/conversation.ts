import { agent } from "./agent";
import { RetortMessage } from "./message";
import { id } from "./id";

export class Conversation {
    readonly id = id("cnv");
    readonly chat = this;
    readonly messagePromises: (RetortMessage | Promise<RetortMessage>)[] = [];
    get messages(): RetortMessage[] {
        for (let m of this.messagePromises) {
            console.log("messagePromises", m, this.messagePromises)
            if (!(m instanceof RetortMessage)) {
                throw new Error("Cannot access messages until all promises have resolved.");
            }
        }
        return this.messagePromises as RetortMessage[];
    }
    user = agent(this, { role: "user", action: "input" });
    assistant = agent(this, { role: "assistant", action: "generation" });
    system = agent(this, { role: "system", action: null });
}
