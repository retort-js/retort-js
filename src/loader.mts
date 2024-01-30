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

    if (url.includes(".rt.")) {


        // Read the file content
        let source = fs.readFileSync(fileURLToPath(url), 'utf8');

        let prefix = `async function ___rtScript($) {`;
        let suffix = `}; let ___x = module.exports = ___retortScriptFunc(___rtScript);`;

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
