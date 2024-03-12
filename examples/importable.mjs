import { Conversation, retort, run } from "../dist/index.js";

await run(import("./script-example.rt.js"));

let $ = new Conversation();

await $.run(import("./script-example.rt.js"));
await $.run(await import("./script-example.rt.js"));
await $.run(require("./script-example.rt.js"));

await $.user.input();

await $.assistant.generation();
