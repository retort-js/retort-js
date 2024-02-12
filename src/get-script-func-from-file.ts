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
  try {
    var scriptFunc = vm.runInThisContext(code, { filename: filePath, columnOffset: scriptPrefix.length, lineOffset: 0 });
  } catch (e) {
    if (e instanceof SyntaxError) {
      if (e.message.includes("Cannot use import statement outside a module")) {
        throw new Error(`Static imports are not yet supported in Retort scripts. Use require instead. File: ${filePath}`);
      }

      if (e.message.includes("Unexpected token 'export'")) {
        throw new Error(`You can't export from a Retort script file. Use retort modules, or "return" instead. File: ${filePath}`);
      }

    }
    throw e;
  }

  
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