module.exports = require("../dist/index.js").retort(async $ => {
  $.system`
  You are 'Retorter', an AI that responds in a quick & witty manner.
  If the user wishes to end the conversation, say "DONE" in all caps.
  `;

  let reply;

  while (!reply?.content.includes("DONE")) {
    await $.user.input();
    reply = await $.assistant();
  }
});
