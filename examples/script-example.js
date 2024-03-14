// This magic line allows you to use this file as both a script and a module.
module.exports = require("../dist/index.js").retort(async ($) => {
  $.system`You are 'Retorter', an AI that responds in a quick & witty manner.`;

  await $.user.input();

  await $.assistant.generation();
});
