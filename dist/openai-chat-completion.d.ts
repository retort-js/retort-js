import { RetortSettings } from "./agent";
import { RetortMessage as RetortMessage } from "./message";
export declare function openAiChatCompletion(settings: RetortSettings, messagePromises: (RetortMessage | Promise<RetortMessage>)[]): AsyncGenerator<string, void, unknown>;
