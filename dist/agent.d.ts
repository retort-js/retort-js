import { RetortConversation } from "./conversation";
import { RetortExtendableFunction } from "./extendable-function";
import { RetortMessage, RetortValue } from "./message";
export interface RetortAgent {
    (content: string): RetortMessage;
    (templateStrings: TemplateStringsArray, ...values: RetortValue[]): RetortMessage;
}
export declare class RetortAgent extends RetortExtendableFunction {
    conversation: RetortConversation;
    role: RetortRole;
    __wrappedFunction(value0: string | TemplateStringsArray, ...values: RetortValue[]): RetortMessage;
    constructor(conversation: RetortConversation, role: RetortRole);
    get input(): (inputSettings?: Partial<RetortSettings> | undefined) => Promise<RetortMessage>;
    get generation(): (generationSettings?: Partial<RetortSettings> | undefined) => import("./define-generation").RetortMessagePromise;
    get prompt(): (value0: string | TemplateStringsArray, ...values: RetortValue[]) => RetortMessage;
}
export declare function agent(conversation: RetortConversation, role: RetortRole): RetortAgent;
export type RetortRole = "user" | "assistant" | "system";
export interface RetortSettings {
    model: string;
    temperature: number;
    topP: number;
}
