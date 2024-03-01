import { Conversation } from "../dist/index.js";
let $ = new Conversation();

$.system
    `You are 'Retorter', an AI that responds in a quick & witty manner.
    If the user wishes to end the conversation, say "DONE" in all caps.`

do {

    await $.user.input();

    var reply = await $.assistant.generation();

} while (!reply.content.includes("DONE"))
