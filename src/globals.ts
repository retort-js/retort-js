import type { Conversation } from "./conversation";
import type { RetortScript } from "./script";

declare global {
    const $: Conversation; // Use 'any' type or a more specific type or interface.
}

// Declare a wildcard module for ".rt." files. 
// You're only allowed to declare these in .d.ts files - but to get it to copy to the output directory, we just ignore this error.
// @ts-expect-error
declare module "*.rt.*" {
    export = RetortScript;
}