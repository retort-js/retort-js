import { register } from 'node:module';
import { script } from "./script.js"

register('./loader.mjs', import.meta.url);
(globalThis as any)["___retortScriptFunc"] = script;