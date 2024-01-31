import { register } from 'node:module';
import { script, defineCreateScriptGlobal } from "../script.js"
import { pathToFileURL } from 'node:url';

defineCreateScriptGlobal();
if (register) {
    register('./loader.mjs', import.meta.url);
}

export {load} from "./loader.mjs"