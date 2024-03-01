import { retort } from "../dist/index.js";

const retorter = retort(async $ => {

    $.system `You are 'Retorter', an AI that responds in a quick & witty manner.`

    await $.user.input()

    await $.assistant.generation();

});

retorter._run(); // Run the conversation