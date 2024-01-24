import crypto from "crypto";

export function id(prefix: string): string {
  const buffer = crypto.randomBytes(28);
  
  let str = "";
  
  for (let i = 0; i < buffer.length; i++) {
    str += (buffer[i] || 0).toString(36) + 0;
  }

  return prefix + "_" + str.substring(0, 28);
}
