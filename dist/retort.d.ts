import { RetortConversation } from "./conversation";
export interface Retort<T> {
    _run: (...values: any[]) => RetortInProgress<T>;
    retortId: string;
    retortHash: string;
    retortType: "retort";
}
export interface RetortInProgress<T> {
    retortId: string;
    $: RetortConversation;
    completionPromise: Promise<T>;
}
export declare function retort<T>(chatFunction: ChatFunction<T>): Retort<T>;
type ChatFunction<T> = ($: RetortConversation, ...values: any[]) => T;
export {};
