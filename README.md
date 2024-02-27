# Retort-js

![NPM License](<https://img.shields.io/npm/l/retort-js?color=%09hsl(262%2C%2083%25%2C%2058%25)>)

Intuitive, production-ready prompt chaining in Javascript.

// what is this solving, who is it for etc, where can it be used etc...

## Getting Started

### Installation

To install via NPM, run:

```sh
npm i retort-js
```

### Give Retort a try

The quickest way to try Retort is in our playground:

// Link to stackblitz here

This will open a project with some example scripts, and a UI where you can run your scripts and see the output of each message in the conversation.

You will need to add your own OpenAI api key.

### How to run your first Retort script

#### Api key setup

> Note: Currently only setup to use with OpenAI's api.

Add your OpenAi api key to the following environment variable:

```
OPENAI_API_KEY=<your key>
```

#### Setup 'retort' directory

Create a 'retort' directory within your project. This will be the root directory for all your retort scripts.

#### Create first file

Create a new example.rt.js file and copy and paste the following code:

```js
module.exports = require("retort-js").retort(async ($) => {
  $.system`Write a haiku about LLMs (Large Language Models).`;

  await $.assistant();
});
```

#### Run the script

You can see the output of the conversation directly in your console by running the following command:

```sh
node retort/example.rt.js
```

This will show you each message in the conversation so you can easily see what happpen at each step of the conversation.

#### What's going on here?

We are defining a new conversation, passing a simple instruction to the system and then awaiting the response from the LLM.

##### retort()

The retort function creates a Retort object. This object represents a conversation that can be run. The function takes a chatFunction as an argument, which is a function that defines the conversation (ie, your script).

The chatFunction takes a RetortConversation ($) as an argument. It can also take any number of additional arguments but we don't need those for this example.

The retort function then returns a Retort object that includes a unique ID, a run function, and a retortType property. You can then call this run function on the exported Retort object wherever you're using it in your codebase.

##### The $

This is a RetortConversation. It keeps track of all the messages in a script and exposes methods for creating a message for each role type (system, user and assistant), and allows you to build a chain of prompts.

These can be called with a string or with a tagged template literal:

```js
// valid
$.system("Write a haiku about LLMs (Large Language Models).");

// also valid

$.system`Write a haiku about LLMs (Large Language Models).`;
```

### Examples

A basic script that accepts user input:

```js
module.exports = require("retort-js").retort(async ($) => {
  $.system`You are 'Retorter', an AI that responds in a quick & witty manner.`;

  await $.user.input();

  await $.assistant.generation();
});
```

The script will wait for your input into the console before calling the assistant.generation() function.

---

Passing parameters to a conversation:

```js
module.exports = require("retort-js").retort(async ($, age) => {
  $.user`A birthday message for someone ${age} years old`;

  await $.assistant.generation();
});
```

---

A script that imports and runs another script:

```js
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

retorter._run(); // Run the conversation
```

---

### Vocabulary

| Term           | Description |
| -------------- | ----------- |
| `retort`       | A something |
| `conversation` | ...todo     |
| `chatFunction` | ...todo     |
| `messages`     | ...todo     |
| `run`          | ...todo     |

### Join our Community

Join us in the Text Alchemy discord to share your experiences, ask questions and get help from the creators.
