# RetortJS

![NPM License](<https://img.shields.io/npm/l/retort-js?color=%09hsl(262%2C%2083%25%2C%2058%25)>)

Intuitive prompt chaining in Javascript. Designed for production.

## Usage

```js
module.exports = require('retort-js').retort(async ($) => {
  $.system`You are 'Retorter', an AI that responds in a quick & witty manner.`;
  
  await $.user.input({query: "Ask a question: "});

  await $.assistant.generation();
});
```

Refer to the [examples](#examples) section below for more details.

## Getting Started

### Installation

To install via NPM, run:

```sh
npm i retort-js
```

---

### Give Retort a try

The quickest way to try Retort is in our playground:

<a href="https://stackblitz.com/fork/github/retort-js/playground?file=retort%2Fscript-template.rt.js&hideNavigation=1&showSidebar=0" style="display: inline-block; background-color: #9146FF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold" target="_blank">RetortJS Playground</a>

This will open a development project with an example script you can modify, and a UI where you can run your script and see the output of each message in the conversation. You will need to add your own OpenAI API key.

---

### How to run your first Retort script

#### API key setup

> [!NOTE]
> Currently only setup to use with OpenAI's API.

Add your OpenAI API key to the following environment variable:

```
OPENAI_API_KEY=<your key>
```

#### Setup 'retort' directory

Create a `retort` directory within your project to store your Retort scripts. This isn't required but is recommended as [@retort-js/dev-server](https://www.npmjs.com/package/@retort-js/dev-server) will search for scripts here.

#### Create first file

Create a new `example.rt.js` file and copy and paste the following code:

```js
module.exports = require('retort-js').retort(async ($) => {
  $.system`You are 'Retorter', an AI that responds in a quick & witty manner.`;

  await $.user.input({query: "Ask a question: "});

  await $.assistant.generation();
});
```

#### Run the script

You can see the output of the conversation directly in your console by running the following command:

```sh
node retort/example.rt.js
```

This will show you each message in the conversation so you can easily see what happens at each step of the conversation.

#### What's going on here?

`module.exports = require('retort-js').retort(async ($) => { ... })` imports the Retort library, defines a Retort script with the retort() function, and exports it. You don't need to import/export like this, but it's recommended for simplicity. 

In the script we are passing a simple instruction to the system and then waiting for the user to input their message before finally awaiting the response from the LLM.


##### The $

This is a RetortConversation. It keeps track of all the messages in a script and exposes methods for creating a message for each role type (system, user and assistant), and allows you to build a chain of prompts.

These can be called with a string or with a tagged template literal:

```js
// valid
$.system("Write a haiku about Large Language Models.");

// also valid
$.system`Write a haiku about Large Language Models.`;
```

In your terminal you should see the initial system message. You can now enter your own message for the assistant to reply to. Once you've entered your message the `assistant.generation()` function will interface with the OpenAI API and return the response.

You can now see exactly what happened each step of the way.

The [RetortConversation](#retortconversation-properties) object also exposes various settings such as the model, temperature and topP.

## retort()

The retort function creates a Retort object. This object represents a conversation that can be run. The function takes a chatFunction as an argument, which is a function that defines the conversation (ie, your script).

The chatFunction takes a RetortConversation ($) as an argument. It can also take any number of additional arguments but we don't need those for this example.

The retort function then returns a Retort object that includes a unique ID, a _run function, and a retortType property. You can then call this _run function on the exported Retort object wherever you're using it in your codebase. It allows you to run the file as either a script or a module:

```js
const retorter = retort(async ($) => {/* script goes here */});

// as a script
retorter._run();

// as a retort module
retort(async ($) => {
  await $.run(retorter);
});

```

# Examples

A script that keeps a conversation open with an LLM until the user is ready to end the conversation:

```js
module.exports = require("retort-js").retort(async $ => {
  $.system`
  You are 'Retorter', an AI that responds in a quick & witty manner.
  If the user wishes to end the conversation, say "DONE" in all caps.
  `;

  let reply;

  while (!reply?.content.includes("DONE")) {
    await $.user.input();
    reply = await $.assistant.generation();
  }
});
```

The script will wait for your input into the console before calling the assistant.generation() function.

---

Passing parameters to a conversation:

```js
module.exports = require("retort-js").retort(async ($, { age }) => {
  $.user`A birthday message for someone ${age} years old`;

  await $.assistant.generation();
});
```

---

A script that imports and runs another script:

```js
// script.rt.js
module.exports = require("retort-js").retort(async ($) => {
  const imported = await $.run(require("./example-2.rt.js"));
  
  // use the imported conversation here
});
```

---

If you're using ESM:

```js
import { retort } from "retort-js";

const retorter = retort(async ($) => {
  $.system`You are 'Retorter', an AI that responds in a quick & witty manner.`;

  await $.user.input();

  await $.assistant.generation();
});

retorter._run(); // run the conversation
```

---

## RetortConversation Properties

| Property          | Description                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------- |
| `id`              | A unique identifier for the conversation.                                                                     |
| `chat`            | A reference to the conversation itself.                                                                       |
| `messagePromises` | An array of messages or promises of messages in the conversation.                                             |
| `settings`        | An object containing settings for the conversation, including the model used, temperature, and topP.          |
| `model`           | A getter and setter for the model used in the conversation.                                                   |
| `temperature`     | A getter and setter for the temperature setting of the conversation.                                          |
| `topP`            | A getter and setter for the topP setting of the conversation.                                                 |
| `messages`        | A getter for the messages in the conversation. Throws an error if any message promises have not yet resolved. |
| `user`            | An agent representing the user in the conversation.                                                           |
| `assistant`       | An agent representing the assistant in the conversation.                                                      |
| `system`          | An agent representing the system in the conversation.                                                         |
| `input`           | A getter for the user's input in the conversation.                                                            |
| `generation`      | A getter for the assistant's generation in the conversation.                                                  |
| `prompt`          | A getter for the user's prompt in the conversation.                                                           |

---

## User Properties

| Property          | Description                                                                                                                                                                 |
|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `id`              | A unique identifier for the conversation.                                                                                                                                   |
| `chat`            | A reference to the conversation itself.                                                                                                                                     |
| `messagePromises` | An array of messages or promises of messages in the conversation.                                                                                                           |
| `settings`        | An object containing settings for the conversation, including the model used, temperature, and topP.                                                                        |
| `model`           | A getter and setter for the model used in the conversation.                                                                                                                 |
| `temperature`     | A getter and setter for the temperature setting of the conversation.                                                                                                        |
| `topP`            | A getter and setter for the topP setting of the conversation.                                                                                                               |
| `messages`        | A getter for the messages in the conversation. Throws an error if any message promises have not yet resolved.                                                               |
| `user`            | An agent representing the user in the conversation.                                                                                                                         |
| `input`           | A getter for the user's input in the conversation. It takes an object ```{query: string} ```as an argument. This defines what input query the user will see in the console. |
| `assistant`       | An agent representing the assistant in the conversation.                                                                                                                    |
| `system`          | An agent representing the system in the conversation.                                                                                                                       |
| `generation`      | A getter for the assistant's generation in the conversation.                                                                                                                |
| `prompt`          | A getter for the user's prompt in the conversation.                                                                                                                         |

---

# Join our Community

Join us in the [Text Alchemy]("https://discord.gg/YdZBFfWpYz") Discord to share your experiences, ask questions and get help from the creators.
