import { RetortModel, RetortSettings, agent, assistant, system, user } from "./agent";
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

    get model() {
        return this.settings.model;
    }

    set model(value: RetortModel) {
        this.settings.model = value.toString();
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

    readonly messages: RetortMessage[] = [];

    /**
     * Use the promise property of each message to get an array of promises
     * @deprecated
     */
    get messagePromises() {
        return this.messages.map((m) => m.promise);
    }

    user = user(this);
    assistant = assistant(this);
    system = system(this);

    get input() {
        return defineInput(this, "user", false)
    };

    get generation() {
        return defineGeneration(this, "assistant", false);
    }

    private get prompt() {
        return definePrompt(this, "user", false);
    }

    /**
     * Use the toJSON method
     * @deprecated
     */
    toObject(messages: RetortMessage[] = this.messages): SerializableRetortConversation {
        return {
            id: this.id,
            settings: this.settings,
            messages,
        }
    }

    toJSON(): SerializableRetortConversation {
        return {
            id: this.id,
            settings: this.settings,
            messages: this.messages,
        }
    }

    /**
     * If you need this create a fromJSON method
     * @deprecated
     */
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
