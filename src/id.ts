export function id(prefix: string): string {
    const array = new Uint32Array(28);

    if (!(globalThis as any).crypto || !(globalThis as any).crypto.getRandomValues) {
        throw new Error('Your js enviroment does not support crypto.getRandomValues');
    }

    (globalThis as any).crypto.getRandomValues(array);
    let str = '';
    for (let i = 0; i < array.length; i++) {

        // Not clear why array[i] can be undefined, but it can according to the types.
        str += (array[i] || 0).toString(36) + 0;

    }
    return prefix + "_" + str.substring(0, 28);
}



