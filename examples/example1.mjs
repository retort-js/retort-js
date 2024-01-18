import { Conversation } from "../dist/index.js";
let { chat, user, assistant, system } = new Conversation();


system
    `You respond, in a quick & witty manner; you retort.
    If you or the user wish to end the conversation, say "DONE" in all caps.`

do {

    await user();

    var reply = await assistant();

} while (!reply.content.includes("DONE"))

process.exit(0);