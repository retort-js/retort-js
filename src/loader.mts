import { fileURLToPath, pathToFileURL } from 'url';
import fs from 'fs';
import { sourceTransformer } from './source-transformer.js';

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
    shortCircuit?: boolean;
}> {

    // Get just the name of the file from the url
    let components = url.trim().split('/');
    let filename = components.pop() || components.pop() || "";

    if (filename.includes(".rt.") || filename.endsWith(".retort") || filename.includes(".retort.")) {


        // Read the file content
        let {source, format} = await defaultLoad(
            url,
            {
              ...context,
            },
            defaultLoad
          );

        if (typeof source !== "string") {
            throw new Error("Retort loader: source must be supplied to the loader as a string.")

        }

        source = sourceTransformer(source);

        // Return the modified source code
        return {
            format: format,
            source: source,
            // shortCircuit: true,
        };
    }

    return defaultLoad(url, context, defaultLoad);

}

export type NodeLoaderHooksFormat = 'builtin' | 'commonjs' | 'dynamic' | 'json' | 'module' | 'wasm';
export interface NodeImportAssertions {
    type?: 'json';
}
