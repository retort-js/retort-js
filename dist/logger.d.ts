declare const createHash: (string: string) => string;
declare const tryGetFromLog: (hash: string) => any;
declare const logScript: (hash: string, obj: any) => string;
export { createHash, tryGetFromLog, logScript };
