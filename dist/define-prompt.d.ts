import { RetortConversation } from "./conversation";
import { RetortMessage, RetortValue } from "./message";
export declare function definePrompt(conversation: RetortConversation, role: "user" | "assistant" | "system", push: boolean): (value0: string | TemplateStringsArray, ...values: RetortValue[]) => RetortMessage;
