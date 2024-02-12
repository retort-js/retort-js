// Declare a global variable in global scope
// This will be available to all files in the project

import { Conversation } from "./conversation";
import { createRequire } from 'node:module';

let re = createRequire(__dirname);


declare global {
    const $: Conversation;

}