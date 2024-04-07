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
    /**
     * @deprecated
     */
    readonly chat = this; 

    protected get __wrappedFunction() {
        return this.prompt;
    }

    settings: RetortSettings = {
        model: "gpt-3.5-turbo",
        temperature: 1,
        topP: 1,
    };

    run = run;

    /**
     * @deprecated
     * @see settings.model
     */
    get model() {
        return this.settings.model;
    }

    /**
     * @deprecated
     * @see settings.model
     */
    set model(value: string) {
        this.settings.model = value;
    }

    /**
     * @deprecated
     * @see settings.temperature
     */
    get temperature() {
        return this.settings.temperature;
    }


    /**
     * @deprecated
     * @see settings.temperature
     */
    set temperature(value: number) {
        this.settings.temperature = value;
    }

    /**
     * @deprecated
     * @see settings.topP
     */
    get topP() {
        return this.settings.topP;
    }

    /**
     * @deprecated
     * @see settings.topP
     */
    set topP(value: number) {
        this.settings.topP = value;
    }

    readonly messages: RetortMessage[] = [];

    /**
     * Use the promise property of each message to get an array of promises
     * @deprecated
     */
    get messagePromises() {
        return this.messages.map((m) => m.promise);
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

    private get prompt() {
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
        conversation.messages.push(...obj.messages);
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
