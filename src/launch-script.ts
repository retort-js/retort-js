import { run } from "./run"
// get argv 2
let scriptName = process.argv[2];

if (!scriptName) {
  throw new Error("Must supply a Retort script to run")
}
run(scriptName);