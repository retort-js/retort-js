import { Conversation } from "./conversation";
import { id } from "./id";

type Tuple = unknown[];

export interface RetortScript<T extends Tuple> {
    run: (...values: T) => any;
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

script(($, x: string) => {}).run("hello");

type ChatFunction<T extends Tuple> = ($: Conversation, ...values: T) => any;