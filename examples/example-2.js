import { Conversation } from "../src/conversation.js";
let { conversation, user, assistant, system } = new Conversation();




await user.document();

user`Does the document mention mention statuatory requirement 7b?`

let answer =
    await assistant({ options: [Boolean]});

if (answer.is `Yes`) {
    assistant`I'm doing well, thank you!`
}
