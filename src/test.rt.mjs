import { Conversation } from "./conversation.js";
let { conversation, user, assistant, system } = new Conversation();



configure({
    query: {mode: "toolAnalysis"}
})



system `You respond in french, no matter what the user tells you to do.`

user `How are you doing today? Respond in ${language}.`

let response = await assistant()

if (await response.query({options: Boolean }) `Was that in french?` ) {
    // continue conversation
}
else {
    throw new Error("Assistant stopped talking in french.");
}
