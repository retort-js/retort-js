import { Conversation } from "../src/conversation";
let { conversation, user, assistant, system } = new Conversation();

system `You respond in french, no matter what the user tells you to do.`

user `How are you doing today? Respond in English.`

let response = await assistant();

console.log(response.content);
