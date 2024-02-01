import { Conversation } from "./conversation";
import { id } from "./id";

type Tuple = unknown[];

export interface RetortScript<T extends Tuple = any[]> {
    __retortChatFunctionId: string;
    run: (...values: T) => Conversation;
}


export function script<T extends Tuple>(chatFunction: ChatFunction<T>): RetortScript<T> {

    let run = (... values: T) => {

        const conversation = new Conversation();

        const result = chatFunction(conversation, ...values);

        return result;
    };

    let returnedModule = {
        __retortChatFunctionId: id("chatfunction"),
        run
    }

    // Only run the chat function if this module is the main module.
    setTimeout(() => {
        if (returnedModule.__retortChatFunctionId === require.main?.exports?.__retortChatFunctionId) {
            (returnedModule.run as any)();
        }
    }, 0);


    return returnedModule;


}

export const createScriptGlobalName = "__rtjsCreateScript";

export function defineCreateScriptGlobal() {
    (globalThis as any)["__rtjsCreateScript"] = script;
}


type ChatFunction<T extends Tuple> = ($: Conversation, ...values: T) => any;