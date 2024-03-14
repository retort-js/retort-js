import { RetortScriptImport } from "./conversation";
import { Retort } from "./retort";
type RunOptions = {
    shouldSaveToLog?: boolean;
    shouldUseCache?: boolean;
};
export declare function run<T>(promiseOrRetort: Promise<RetortScriptImport<T>> | Retort<T> | RetortScriptImport<T>, params?: any, options?: RunOptions): Promise<T>;
export {};
