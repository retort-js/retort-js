// Declare a global variable in global scope
// This will be available to all files in the project

import { Conversation } from "./conversation";

declare global {
    const $: Conversation;

}