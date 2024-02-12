import { getScriptFuncFromFile } from "./get-script-func-from-file";
import { resolveScriptToFilePath } from "./resolve-script-to-file-path";
import { RetortScript, checkIsScriptObject, script } from "./script";
import { pathToFileURL } from "url";
export async function getScript(scriptName: string) {
  
  let {filePath, retortFileType} = await resolveScriptToFilePath(scriptName);
  let url = pathToFileURL(filePath).toString();

  let scriptObject: RetortScript<any>;
  if (retortFileType === "module") {
    let scriptModule = await import(url.toString());
    checkIsScriptObject(scriptModule.default);
    scriptObject = scriptModule.default;
  }
  else if (retortFileType === "script") {
    let scriptFunc = await getScriptFuncFromFile(filePath);
    scriptObject = script(scriptFunc) as RetortScript<any>;
    
  }
  else {
    throw new Error("Unreachable code");
  }

  return {script: scriptObject, url, retortFileType};



}