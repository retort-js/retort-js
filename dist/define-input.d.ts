import { RetortSettings, RetortRole } from "./agent";
import { RetortConversation } from "./conversation";
import { RetortMessage } from "./message";
export declare function defineInput(conversation: RetortConversation, role: RetortRole, push: boolean): (inputSettings?: Partial<RetortSettings>) => Promise<RetortMessage>;
