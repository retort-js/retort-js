import { Conversation } from "../dist/index.js";
let { chat, user, assistant, system } = new Conversation();


system
    `You are 'Retorter' an AI that responds in a quick & witty manner.
    If the user wishes to end the conversation, say "DONE" in all caps.`

do {

    await user();

    var reply = await assistant();

} while (!reply.content.includes("DONE"))

process.exit(0);