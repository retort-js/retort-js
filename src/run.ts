import { Conversation } from "./conversation";
import { id } from "./id";
import vm from "vm"
import fs from "fs";
import path from "path";
import { getRetortDir } from "./retort-dir";
import { script } from "./script";


export async function getScriptFuncFromFile(scriptPathRelativeToRetortDir: string) {
  // Get the file name
  const fileName = path.basename(scriptPathRelativeToRetortDir);

  if (!/^[a-zA-Z]/.test(fileName)) {
    throw new Error(`Script file name must start with a letter: ${fileName}`);
  }



  // Read the script file
  const scriptPath = path.join(getRetortDir(), scriptPathRelativeToRetortDir);
  const innerCode = await fs.promises.readFile(scriptPath, 'utf8');
  let scriptPrefix = getScriptPrefix(fileName);
  let scriptSuffix = getScriptSuffix(fileName);
  const code = scriptPrefix + innerCode + scriptSuffix;

  // Run the script in the VM
  let scriptFunc = vm.runInThisContext(code, { filename: scriptPath, columnOffset: scriptPrefix.length, lineOffset: 0 });

  return scriptFunc;
}

export function stringToValidJsIdentifier(str: string) {
  return "__rtScript_" + (str.replace(/[^a-zA-Z0-9_]/g, "_") || "unknown_script");
}

let getScriptPrefix = (name: string) => `
((() => {
  const ${name} = async (__$__) => {
    const $ = __$__;


`.trim().replace(/ *[\r\n] */g, " ")

let getScriptSuffix = (name: string) => `






  };

  return ${name};
})())`