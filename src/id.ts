import crypto from "crypto";

export function id(prefix: string): string {
  const length = 28
  const buffer = crypto.randomBytes(length);
  
  let str = "";
  
  for (let i = 0; i < buffer.length; i++) {
    let base36Representation = (buffer[i] || 0).toString(36);
    let leastSignificantDigit = base36Representation[base36Representation.length - 1];
    str += leastSignificantDigit;
  }

  return prefix + "-" + str;
}
