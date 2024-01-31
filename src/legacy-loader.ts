import { fileURLToPath } from 'url';
import fs from 'fs';
import { sourceTransformer } from './source-transformer.js';

export async function getFormat(
    url: string,
    context: {},
    defaultGetFormat: (url: string) => Promise<{ format: string }>
) {
    let components = url.trim().split('/');
    let filename = components.pop() || components.pop() || "";

    if (filename.includes(".rt.")) {
        return { format: 'commonjs' };
    }

    return defaultGetFormat(url);
}

export async function transformSource(
    source: string | Buffer,
    context: { url: string },
    defaultTransformSource: (source: string | Buffer, context: { url: string }) => Promise<{ source: string | Buffer }>
) {
    let components = context.url.trim().split('/');
    let filename = components.pop() || components.pop() || "";

    if (filename.includes(".rt.")) {
        source = await fs.promises.readFile(fileURLToPath(context.url), 'utf8');

        source = sourceTransformer(source);

        // Return the modified source code
        return { source };
    }

    return defaultTransformSource(source, context);
}