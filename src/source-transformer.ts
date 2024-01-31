export function sourceTransformer(source: string) {
    let prefix = `__rtScript(async $ => {`;
    let suffix = `\n\n\n\n\n});\n\nfunction __rtScript(scriptFunc) { module.exports = ___retortScriptFunc(scriptFunc); }`;

    // Modify the source code
    let modifiedSource = prefix + source + suffix;
    return modifiedSource;
}