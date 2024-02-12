import vm from "vm"
import fs from "fs";
import path from "path";
import { getRetortDir } from "./get-retort-dir";
import { ScriptFunction } from "./script";

export async function getScriptFuncFromFile(filePath: string) {
  // Get the file name
  const fileName = path.basename(filePath);

  if (!/^[a-zA-Z]/.test(fileName)) {
    throw new Error(`Script file name must start with a letter: ${fileName}`);
  }



  // Read the script file
  const innerCode = await fs.promises.readFile(filePath, 'utf8');
  let identifier = stringToValidJsIdentifier(fileName);
  let scriptPrefix = getScriptPrefix(identifier);
  let scriptSuffix = getScriptSuffix(identifier);
  const code = scriptPrefix + innerCode + scriptSuffix;

  // Run the script in the VM
  vm.Module
  let scriptFunc = vm.runInThisContext(code, { filename: filePath, columnOffset: scriptPrefix.length, lineOffset: 0 });

  return scriptFunc as ScriptFunction<any>;
}

export function stringToValidJsIdentifier(str: string) {
  return "__rtScript_" + (str.replace(/[^a-zA-Z0-9_]/g, "_") || "unknown_script");
}

let getScriptPrefix = (name: string) => `
((() => {
  const ${name} = async (_$, require) => {
    const $ = _$;


`.trim().replace(/ *[\r\n] */g, " ")

let getScriptSuffix = (name: string) => `






  };

  return ${name};
})())`