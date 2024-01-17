export function id(prefix: string): string {
    const array = new Uint32Array(4);
    crypto.getRandomValues(array);
    let id = '';
    for (let i = 0; i < array.length; i++) {
        id += array[i].toString(36);
    }
    return prefix + "-" + id;
}
