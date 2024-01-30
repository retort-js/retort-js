import { Conversation } from "./conversation";
import { id } from "./id";

export function script<T>(chatFunction: ChatFunction<T>) {

    let run = (... values: any[]) => {

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
            returnedModule.run();
        }
    }, 0);


    return returnedModule;


}

type ChatFunction<T> = ($: Conversation, ...values: any[]) => T;