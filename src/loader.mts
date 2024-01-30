import { fileURLToPath } from 'url';
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
}> {
    


    if (url.includes(".rt.")) {

        console.log("Loading retort file", url);
        // Read the file content
        let source = fs.readFileSync(fileURLToPath(url), 'utf8');

        // Modify the source code
        source = `console.log('Module loaded: ${url}');\n` + source;

        // Return the modified source code
        return {
            format: 'commonjs',
            source,
        };
    }

    return defaultLoad(url, context, defaultLoad);

}

export type NodeLoaderHooksFormat = 'builtin' | 'commonjs' | 'dynamic' | 'json' | 'module' | 'wasm';
export interface NodeImportAssertions {
    type?: 'json';
}
