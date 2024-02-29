import { Conversation } from "../dist/index.js";

let $ = new Conversation();

$.system `You are 'Retorter', an AI that responds in a quick & witty manner.`
await $.user.input()
await $.assistant.generation();