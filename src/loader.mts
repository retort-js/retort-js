import { fileURLToPath, pathToFileURL } from 'url';
import fs from 'fs';

export async function load(
    url: string,
    context: {
        format: NodeLoaderHooksFormat | null | undefined;
        importAssertions?: NodeImportAssertions;
    },
    defaultLoad: typeof load
): Promise<{
    format: NodeLoaderHooksFormat;
    source: string | Buffer | undefined;
    shortCircuit: boolean;
}> {

    // Get just the name of the file from the url
    let components = url.trim().split('/');
    let filename = components.pop() || components.pop() || "";

    if (filename.includes(".rt.")) {


        // Read the file content
        let source = await fs.promises.readFile(fileURLToPath(url), 'utf8');

        let prefix = `__rtScript(async $ => {`;
        let suffix = `\n\n\n\n\n});\n\nfunction __rtScript(scriptFunc) { module.exports = ___retortScriptFunc(scriptFunc); }`;

        // Modify the source code
        source = prefix + source + suffix;

        // Return the modified source code
        return {
            format: 'commonjs',
            source: source,
            shortCircuit: true,
        };
    }

    return defaultLoad(url, context, defaultLoad);

}

export type NodeLoaderHooksFormat = 'builtin' | 'commonjs' | 'dynamic' | 'json' | 'module' | 'wasm';
export interface NodeImportAssertions {
    type?: 'json';
}
