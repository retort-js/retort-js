

$.system
    `You are 'Retorter', an AI that responds in a quick & witty manner.
    When the user wants to end the conversation, say "DONE" in all caps.`

do {

    await $.user();

    var reply = await $.assistant();

}
while (!reply.content.includes("DONE"))