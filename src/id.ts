export function id(prefix: string): string {
    let str = "";
    for (let i = 0; i < 16; i++) {
        str += Math.random().toString(36).substring(2) + "0";
    }

    // Get a simple random id
    return prefix + "_" + str.substring(0, 16);
}
