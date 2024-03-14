import { RetortSettings, RetortRole } from "./agent";
import { RetortConversation } from "./conversation";
import { RetortMessage } from "./message";
export interface RetortMessagePromise extends Promise<RetortMessage> {
    stream: AsyncGenerator<string, void, unknown>;
}
export declare function defineGeneration(conversation: RetortConversation, role: RetortRole, push: boolean): (generationSettings?: Partial<RetortSettings>) => RetortMessagePromise;
