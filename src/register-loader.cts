import { register } from 'node:module';
import { script } from "./script.js"
import { pathToFileURL } from 'node:url';

register('./loader.mjs', pathToFileURL(module.path));
(globalThis as any)["___retortScriptFunc"] = script;