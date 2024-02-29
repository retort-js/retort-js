import { RetortSettings, agent } from "./agent";
import { RetortMessage, RetortValue } from "./message";
import { id } from "./id";
import { RetortExtendableFunction } from "./extendable-function";
import { defineInput } from "./define-input";
import { defineGeneration } from "./define-generation";
import { definePrompt } from "./define-prompt";

export class RetortConversation extends RetortExtendableFunction {
    readonly id = id("cnv");
    readonly chat = this;
    readonly messagePromises: (RetortMessage | Promise<RetortMessage>)[] = [];

    get __wrappedFunction() {
        return this.prompt;
    }

    settings: RetortSettings = {
        model: "gpt-3.5-turbo",
        temperature: 1,
        topP: 1,
    };

    get model() {
        return this.settings.model;
    }

    set model(value: string) {
        this.settings.model = value;
    }

    get temperature() {
        return this.settings.temperature;
    }

    set temperature(value: number) {
        this.settings.temperature = value;
    }

    get topP() {
        return this.settings.topP;
    }

    set topP(value: number) {
        this.settings.topP = value;
    }


    get messages(): RetortMessage[] {
        for (let m of this.messagePromises) {
            console.log("messagePromises", m, this.messagePromises)
            if (!(m instanceof RetortMessage)) {
                throw new Error("Cannot access messages until all promises have resolved.");
            }
        }
        return this.messagePromises as RetortMessage[];
    }
    user = agent(this, "user");
    assistant = agent(this, "assistant");
    system = agent(this, "system");

    get input() {
        return defineInput(this, "user", false)
    };

    get generation() {
        return defineGeneration(this, "assistant", false);
    }

    get prompt() {
        return definePrompt(this, "user", false);
    }
}


export interface RetortConversation {
    (input: string): RetortMessage,
    (templateStrings: TemplateStringsArray, ...values: RetortValue[]): RetortMessage

}
