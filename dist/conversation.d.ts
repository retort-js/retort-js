import { RetortSettings } from "./agent";
import { RetortMessage, RetortValue } from "./message";
import { RetortExtendableFunction } from "./extendable-function";
import { Retort } from "./retort";
import { run } from "./run";
export interface RetortScriptImport<T> {
    default: Retort<T>;
}
export declare class RetortConversation extends RetortExtendableFunction {
    readonly id: string;
    readonly chat: this;
    readonly messagePromises: (RetortMessage | Promise<RetortMessage>)[];
    get __wrappedFunction(): (value0: string | TemplateStringsArray, ...values: RetortValue[]) => RetortMessage;
    settings: RetortSettings;
    run: typeof run;
    get model(): string;
    set model(value: string);
    get temperature(): number;
    set temperature(value: number);
    get topP(): number;
    set topP(value: number);
    get messages(): RetortMessage[];
    user: import("./agent").RetortAgent;
    assistant: import("./agent").RetortAgent;
    system: import("./agent").RetortAgent;
    get input(): (inputSettings?: Partial<RetortSettings> | undefined) => Promise<RetortMessage>;
    get generation(): (generationSettings?: Partial<RetortSettings> | undefined) => import("./define-generation").RetortMessagePromise;
    get prompt(): (value0: string | TemplateStringsArray, ...values: RetortValue[]) => RetortMessage;
    toObject(messages?: RetortMessage[]): SerializableRetortConversation;
    static fromObject(obj: SerializableRetortConversation): RetortConversation;
}
export interface RetortConversation {
    (input: string): RetortMessage;
    (templateStrings: TemplateStringsArray, ...values: RetortValue[]): RetortMessage;
}
export interface SerializableRetortConversation {
    id: string;
    settings: RetortSettings;
    messages: RetortMessage[];
}
