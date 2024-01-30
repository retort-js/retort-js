import vm from "vm";
import fs from "fs";
import { Conversation } from "./conversation";

export async function runScript(path: string): Promise<Conversation> {
    let file = await fs.promises.readFile(path);
    let { prefix, suffix } = scriptWrapper(path);
    let prefixLines = prefix.split("\n").length;
    let prefixLastLineChars = prefix.split("\n").pop()?.length || 0;
    let code = prefix + file + suffix;
    console.log(prefixLastLineChars);
    let script = new vm.Script(prefix + file + suffix, {
        filename: path,
        lineOffset: 1 - prefixLines,
        columnOffset: -prefixLastLineChars,
        importModuleDynamically: (specifier) => {
            // Mimic Node.js's default behavior
            return import(specifier) as any;
        },
    });

    let func = script.runInThisContext() as ($: Conversation) => Promise<void>;

    let convo = new Conversation();
    convo.__filePath = path;

    await func(convo);

    return convo;

}



function scriptWrapper(currentFile: string) {
    let functionName = currentFile.split("/").pop()?.split(".").shift()?.replace(/-/g, "_");
    // check if functionName is suitable for use as a JavaScript identifier
    if (functionName && functionName?.match(/^[a-zA-Z_$][0-9a-zA-Z_$]*$/)) {
        functionName = "retortScript_" + functionName;
    }
    else {
        functionName = "retortScript";
    }
    return {
        prefix: `((() => { const ${functionName} = async ($) => {`,
        suffix: `}; return ${functionName}})())`
    }
}

