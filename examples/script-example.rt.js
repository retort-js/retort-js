module.exports = require('../dist/index.js').retort(async ($) => {
  /*
    The magic line above defines and contains the Retort script.
    Edit the script, save it, and bookmark the URL to come back here.
    In order the run the script, scroll to the top of the web view and click the 'run' button.

    Use $.system to define the role of the model.
    Use $.user to define a user message to send to the model.
    Use 'await $.assistant.generation()' to send your message(s) to the model and get a response'.
    Use 'await $.user.input()' to take user input and use it as a message in your script.

    This allows you to specify the way the model answers questions.
    Make sure to wrap your Retort prompts in backticks!
  */

  $.system`
    You are an expert on creative writing. 
    When prompted, you will respond in the style of Edgar Allan Poe.
  `;

  $.user`
    When will AI take over the world?
  `;

  await $.assistant.generation();

  await $.user.input();

  await $.assistant.generation();
});
