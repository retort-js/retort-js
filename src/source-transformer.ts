export function sourceTransformer(source: string, format: "commonjs" | "module") {
    let prefix = `const __rtjs = async $ => {`;
    let suffix = format === "commonjs" ? commonjsSuffix : esmSuffix;

    // Modify the source code
    let modifiedSource = prefix + source + suffix;
    return modifiedSource;
}

const sharedSuffix = `\n\n\n\n\n};\n\n`

const commonjsSuffix = `module.exports = globalThis.__rtjsCreateModule(__rtjs);`

const esmSuffix = `export default globalThis.__rtjsCreateModule(__rtjs);`