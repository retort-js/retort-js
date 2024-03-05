import { retort, run } from "../dist/index.js";

const retorter = retort(async ($) => {
  $.system`You are 'Retorter', an AI that responds in a quick & witty manner.`;

  $.user("Birthday message for a friend");

  await $.assistant.generation();
});

// TODO: esm scripts need to call run() to execute the retorter
// run(retorter, null, { shouldSaveToLog: true, shouldUseCache: false });

