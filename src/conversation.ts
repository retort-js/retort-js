import { RetortSettings, agent } from "./agent";
import { RetortMessage, RetortValue, RetortValueArray } from "./message";
import { id } from "./id";
import { RetortExtendableFunction } from "./extendable-function";
import { defineInput } from "./define-input";
import { defineGeneration } from "./define-generation";
import { definePrompt } from "./define-prompt";
import { Retort, RetortInProgress } from "./retort";
import { run } from "./run";

export interface RetortScriptImport<T> {
    default: Retort<T>;
}

export class RetortConversation extends RetortExtendableFunction {
    readonly id = id("cnv");
    readonly chat = this;
    readonly messagePromises: (RetortMessage | Promise<RetortMessage>)[] = [];

    protected get __wrappedFunction() {
        return this.prompt;
    }

    settings: RetortSettings = {
        model: "gpt-3.5-turbo",
        temperature: 1,
        topP: 1,
    };

    run = run;

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

    toObject(messages: RetortMessage[] = this.messages): SerializableRetortConversation {
        return {
            id: this.id,
            settings: this.settings,
            messages,
        }
    }

    // TODO: not sure this is right as we're losing the original id
    static fromObject(obj: SerializableRetortConversation) {
        const conversation = new RetortConversation();
        conversation.settings = obj.settings;
        conversation.messagePromises.push(...obj.messages);
        return conversation;
    }
}


export interface RetortConversation {
    (input: string): RetortMessage,
    <T extends any[]>(templateStrings: TemplateStringsArray, ...values: RetortValueArray<T>): RetortMessage

}

export interface SerializableRetortConversation {
    id: string;
    settings: RetortSettings;
    messages: RetortMessage[];
}
