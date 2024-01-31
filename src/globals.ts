import type { Conversation } from "./conversation";

declare global {
    const $: Conversation; // Use 'any' type or a more specific type or interface.
}

