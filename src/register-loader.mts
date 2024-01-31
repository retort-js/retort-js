import { register } from 'node:module';
import { script } from "./script.js"
import { pathToFileURL } from 'node:url';

console.log("Registering loader");
register('./loader.mjs', import.meta.url);
(globalThis as any)["__rtjsCreateModule"] = script;