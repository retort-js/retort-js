import { createScriptGlobalName } from "src/script";

const sharedSuffix = `\n\n\n\n\n};\n\n`

const commonjsSuffix = `module.exports = globalThis.${createScriptGlobalName}(__rtjs);`

const esmSuffix = `export default globalThis.${createScriptGlobalName}(__rtjs);`

export function sourceTransformer(source: string, format: "commonjs" | "module") {
    let prefix = `const __rtjs = async $ => {`;
    let suffix = sharedSuffix + (format === "commonjs" ? commonjsSuffix : esmSuffix);

    // Modify the source code
    let modifiedSource = prefix + source + suffix;
    return modifiedSource;
}

