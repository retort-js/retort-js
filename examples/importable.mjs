import { Conversation, retort, run } from "../dist/index.js";

await run(import("./script-example.js"));

let $ = new Conversation();

await $.run(import("./script-example.js"));
await $.run(await import("./script-example.js"));
await $.run(require("./script-example.js"));

await $.user.input();

await $.assistant.generation();
